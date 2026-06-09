import React, { useState } from 'react'
import { Search, AlertCircle, Info } from 'lucide-react'
import { casesApi } from '@/api'
import { StatusResult } from '@/components/case/StatusResult'
import { AddCaseModal } from '@/components/case/AddCaseModal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/store/toastStore'
import { extractError } from '@/lib/utils'
import type { CaseResponse } from '@/types'
import { useSeo } from '@/hooks/useSeo'

type CheckStep = 'idle' | 'loading' | 'result' | 'error'

export const CheckStatusPage: React.FC = () => {
  useSeo({
    title: 'Check Case Status',
    description: 'Look up a court case by CNR number and view its current status.',
  })

  const [cnr, setCnr] = useState('')
  const [cnrError, setCnrError] = useState('')
  const [step, setStep] = useState<CheckStep>('idle')
  const [result, setResult] = useState<CaseResponse | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)

  const validateCnr = (v: string) => {
    if (!v.trim()) return 'CNR number is required'
    if (!/^[A-Z]{4}[0-9]{12}$/.test(v.trim().toUpperCase())) {
      return 'Format: 4 letters + 12 digits (e.g. UPST010058262024)'
    }
    return ''
  }

  const handleSearch = async () => {
    const val = cnr.trim().toUpperCase()
    const err = validateCnr(val)
    if (err) {
      setCnrError(err)
      return
    }

    setCnrError('')
    setStep('loading')
    setErrorMsg('')

    try {
      const res = await casesApi.addCase({ cnrNumber: val })
      if (res.data.success && res.data.data) {
        setResult(res.data.data)
        setStep('result')
      } else {
        const message = res.data.error ?? 'Case not found'
        setErrorMsg(message)
        setStep('error')
      }
    } catch (e) {
      const message = extractError(e)
      setErrorMsg(message)
      setStep('error')
    }
  }

  const handleReset = () => {
    setStep('idle')
    setResult(null)
    setErrorMsg('')
  }

  return (
    <>
      <div className="max-w-lg mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-semibold font-display text-text-primary">Check Case Status</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Look up a CNR number to view the latest case details.
          </p>
        </div>

        <div className="bg-surface-1 border border-border rounded-xl p-5 space-y-4">
          <div className="flex gap-2 p-3 bg-accent/5 border border-accent/15 rounded-lg text-sm text-text-secondary">
            <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
            <p>Enter a CNR number to fetch the current case record from the backend.</p>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="e.g. UPST010058262024"
                value={cnr}
                onChange={(e) => {
                  setCnr(e.target.value.toUpperCase())
                  if (cnrError) setCnrError('')
                  if (step !== 'idle') handleReset()
                }}
                error={cnrError}
                icon={<Search />}
                onKeyDown={(e) => e.key === 'Enter' && step === 'idle' && handleSearch()}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
            <Button
              onClick={step === 'idle' ? handleSearch : handleReset}
              variant={step !== 'idle' ? 'outline' : 'primary'}
              className="shrink-0 self-start mt-[22px]"
            >
              {step !== 'idle' ? 'Clear' : 'Search'}
            </Button>
          </div>
        </div>

        {step === 'loading' && (
          <div className="flex flex-col items-center py-12 gap-4">
            <div className="h-10 w-10 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
            <p className="text-sm text-text-secondary">Fetching case data…</p>
          </div>
        )}

        {step === 'error' && (
          <div className="flex items-start gap-3 p-4 bg-danger/5 border border-danger/20 rounded-xl">
            <AlertCircle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text-primary">Case not found</p>
              <p className="text-sm text-text-secondary mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {step === 'result' && result && (
          <StatusResult
            case_={result}
            alreadyTracking={true}
            onTrack={() => setAddModalOpen(true)}
          />
        )}
      </div>

      <AddCaseModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdded={(c) => {
          setResult(c)
          setStep('result')
          toast.success('Case added')
        }}
      />
    </>
  )
}
