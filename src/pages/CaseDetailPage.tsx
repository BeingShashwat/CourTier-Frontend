import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { casesApi } from '@/api'
import { CaseDetail } from '@/components/case/CaseDetail'
import { DetailSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { toast } from '@/store/toastStore'
import { extractError } from '@/lib/utils'
import { Scale } from 'lucide-react'
import type { CaseResponse } from '@/types'
import { useSeo } from '@/hooks/useSeo'

export const CaseDetailPage: React.FC = () => {
  const { cnrNumber } = useParams<{ cnrNumber: string }>()
  const navigate = useNavigate()

  useSeo({
    title: cnrNumber ? `Case ${cnrNumber}` : 'Case Details',
    description: `View full case details, parties, acts, hearing history and schedules for CNR: ${cnrNumber ?? ''}.`,
  })

  const [case_, setCase] = useState<CaseResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadCase = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await casesApi.getCase(cnrNumber!)
      if (res.data.success && res.data.data) {
        setCase(res.data.data)
      } else {
        setError(res.data.error ?? 'Case not found')
      }
    } catch (e) {
      setError(extractError(e))
    } finally {
      setLoading(false)
    }
  }, [cnrNumber])

  useEffect(() => {
    if (cnrNumber) loadCase()
  }, [cnrNumber, loadCase])

  const handleRefresh = async () => {
    if (!cnrNumber) return
    setRefreshing(true)
    try {
      const res = await casesApi.pollCase(cnrNumber)
      if (res.data.success && res.data.data) {
        setCase(res.data.data)
        toast.success('Case data refreshed')
      } else {
        toast.error('Refresh failed', res.data.error ?? undefined)
      }
    } catch (e) {
      toast.error('Refresh failed', extractError(e))
    } finally {
      setRefreshing(false)
    }
  }

  const handleRemove = async () => {
    if (!cnrNumber) return
    try {
      await casesApi.removeCase(cnrNumber)
      toast.success('Stopped tracking case')
      navigate('/cases')
    } catch (e) {
      toast.error('Failed to remove', extractError(e))
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <DetailSkeleton />
      </div>
    )
  }

  if (error || !case_) {
    return (
      <EmptyState
        icon={<Scale />}
        title="Could not load case"
        description={error || 'This case could not be loaded.'}
        action={
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => void loadCase()}>
              Retry
            </Button>
            <Button variant="outline" onClick={() => navigate('/cases')}>
              Back to cases
            </Button>
          </div>
        }
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <CaseDetail
        case_={case_}
        onRefresh={handleRefresh}
        onRemove={handleRemove}
        onBack={() => navigate('/cases')}
        refreshing={refreshing}
      />
    </div>
  )
}
