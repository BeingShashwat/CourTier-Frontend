import React, { useEffect, useState } from 'react'
import { Plus, Search, Scale, Filter } from 'lucide-react'
import { casesApi } from '@/api'
import { CaseCard } from '@/components/case/CaseCard'
import { AddCaseModal } from '@/components/case/AddCaseModal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CaseCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from '@/store/toastStore'
import { extractError } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { CaseResponse, FilterStatus } from '@/types'
import { useSeo } from '@/hooks/useSeo'

const FILTERS: { label: string; value: FilterStatus }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Disposed', value: 'DISPOSED' },
  { label: 'Transferred', value: 'TRANSFERRED' },
]

export const CasesPage: React.FC = () => {
  useSeo({
    title: 'My Cases',
    description: 'View all your tracked court cases, search by CNR, party names, or court, and filter by status.',
  })

  const [cases, setCases] = useState<CaseResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterStatus>('ALL')
  const [refreshingCnr, setRefreshingCnr] = useState<string | null>(null)

  useEffect(() => { loadCases() }, [])

  const loadCases = async () => {
    try {
      const res = await casesApi.getMyCases()
      if (res.data.success && res.data.data) setCases(res.data.data)
    } catch (e) {
      toast.error('Could not load cases', extractError(e))
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async (cnr: string) => {
    setRefreshingCnr(cnr)
    try {
      const res = await casesApi.pollCase(cnr)
      if (res.data.success && res.data.data) {
        setCases((p) => p.map((c) => (c.cnrNumber === cnr ? res.data.data! : c)))
        toast.success('Case refreshed')
      }
    } catch (e) {
      toast.error('Refresh failed', extractError(e))
    } finally {
      setRefreshingCnr(null)
    }
  }

  const handleRemove = async (cnr: string) => {
    try {
      await casesApi.removeCase(cnr)
      setCases((p) => p.filter((c) => c.cnrNumber !== cnr))
      toast.success('Case removed')
    } catch (e) {
      toast.error('Failed to remove', extractError(e))
    }
  }

  const filtered = cases.filter((c) => {
    const matchesFilter = filter === 'ALL' || c.status === filter
    const q = search.toLowerCase().trim()
    const matchesSearch =
      !q ||
      c.cnrNumber.toLowerCase().includes(q) ||
      c.petitionerName?.toLowerCase().includes(q) ||
      c.respondentName?.toLowerCase().includes(q) ||
      c.caseType?.toLowerCase().includes(q) ||
      c.courtName?.toLowerCase().includes(q)
    return matchesFilter && matchesSearch
  })

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold font-display text-text-primary">My Cases</h1>
            <p className="text-sm text-text-muted mt-0.5">
              {cases.length} case{cases.length !== 1 ? 's' : ''} tracked
            </p>
          </div>
          <Button icon={<Plus />} size="sm" onClick={() => setAddOpen(true)}>
            Add Case
          </Button>
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by CNR, party, court…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search />}
            />
          </div>
          <div className="flex gap-1 bg-surface-1 border border-border rounded-lg p-1 overflow-x-auto no-scrollbar shrink-0">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  'px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-all duration-150',
                  filter === f.value
                    ? 'bg-accent text-white shadow-glow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => <CaseCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 && cases.length === 0 ? (
          <EmptyState
            icon={<Scale />}
            title="No cases tracked"
            description="Start tracking court cases by entering a CNR number."
            action={<Button icon={<Plus />} onClick={() => setAddOpen(true)}>Track a Case</Button>}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Filter />}
            title="No results"
            description="Try adjusting your search or filter."
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((c, i) => (
              <CaseCard
                key={c.cnrNumber}
                case_={c}
                index={i}
                onRefresh={handleRefresh}
                onRemove={handleRemove}
                refreshing={refreshingCnr === c.cnrNumber}
              />
            ))}
          </div>
        )}
      </div>

      <AddCaseModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={(c) => setCases((p) => [c, ...p])}
      />
    </>
  )
}
