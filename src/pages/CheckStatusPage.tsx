import React, { useState, useEffect } from 'react'
import { Search, RefreshCw, AlertCircle, Info } from 'lucide-react'
import { casesApi } from '@/api'
import { StatusResult } from '@/components/case/StatusResult'
import { AddCaseModal } from '@/components/case/AddCaseModal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/store/toastStore'
import { isHighCourtCNR, extractError } from '@/lib/utils'
import type { CaseResponse } from '@/types'
import { useSeo } from '@/hooks/useSeo'

// Captcha step types
type CheckStep = 'idle' | 'captcha' | 'loading' | 'result' | 'error'

export const CheckStatusPage: React.FC = () => {
  useSeo({
    title: 'Check Case Status',
    description: 'Look up any Indian District or High Court case details and status instantly using CNR number without tracking.',
  })

  const [cnr, setCnr] = useState('')
  const [cnrError, setCnrError] = useState('')
  const [step, setStep] = useState<CheckStep>('idle')
  const [result, setResult] = useState<CaseResponse | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  // captcha state (for district courts)
  const [captchaImg, setCaptchaImg] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [captchaSolution, setCaptchaSolution] = useState('')
  const [captchaLoading, setCaptchaLoading] = useState(false)

  // tracked CNRs — check against user's list to show "already tracking"
  const [trackedCnrs, setTrackedCnrs] = useState<Set<string>>(new Set())
  const [addModalOpen, setAddModalOpen] = useState(false)

  useEffect(() => {
    casesApi.getMyCases().then((res) => {
      if (res.data.success && res.data.data) {
        setTrackedCnrs(new Set(res.data.data.map((c: CaseResponse) => c.cnrNumber)))
      }
    }).catch(() => {})
  }, [])

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
    if (err) { setCnrError(err); return }
    setCnrError('')

    const isHC = isHighCourtCNR(val)

    if (isHC) {
      // High court — directly try to add (which also fetches data) or we can
      // use the same add-then-display approach but for status check we use
      // the addCase endpoint and remove it after fetching. Instead, we reuse
      // the backend's existing tracked lookup. For status-only check we try
      // to fetch through the captcha flow regardless.
      // Since HC scrapers have no captcha, we can directly check via add flow:
      await fetchViaAdd(val, undefined, undefined)
    } else {
      // District court — need captcha
      await loadCaptcha(val)
    }
  }

  const loadCaptcha = async (val: string) => {
    setCaptchaLoading(true)
    try {
      const res = await casesApi.getCaptcha(val)
      if (res.data.success && res.data.data) {
        setCaptchaImg(res.data.data.captchaImageBase64)
        setSessionId(res.data.data.sessionId)
        setStep('captcha')
      } else {
        setErrorMsg(res.data.error ?? 'Failed to load captcha')
        setStep('error')
      }
    } catch (e) {
      setErrorMsg(extractError(e))
      setStep('error')
    } finally {
      setCaptchaLoading(false)
    }
  }

  const handleCaptchaSubmit = async () => {
    if (!captchaSolution.trim()) return
    await fetchViaAdd(cnr.trim().toUpperCase(), sessionId, captchaSolution.trim())
  }

  // We use addCase to get real data, then if user doesn't want to track
  // they can untrack. Or better: if already tracked, show existing data.
  // For check-status we add, show, and give option to keep tracking or untrack.
  const fetchViaAdd = async (cnrNumber: string, sid?: string, solution?: string) => {
    setStep('loading')
    try {
      const payload = sid && solution
        ? { cnrNumber, sessionId: sid, captchaSolution: solution }
        : { cnrNumber }

      const res = await casesApi.addCase(payload)
      if (res.data.success && res.data.data) {
        setResult(res.data.data)
        setTrackedCnrs((prev) => new Set([...prev, cnrNumber]))
        setStep('result')
      } else {
        throw new Error(res.data.error ?? 'Case not found')
      }
    } catch (e) {
      const msg = extractError(e)
      // Already tracking is fine — still fetch it
      if (msg.toLowerCase().includes('already tracking')) {
        try {
          const getRes = await casesApi.getCase(cnrNumber)
          if (getRes.data.success && getRes.data.data) {
            setResult(getRes.data.data)
            setStep('result')
            return
          }
        } catch { /* fall through */ }
      }
      if (msg.toLowerCase().includes('captcha') || msg.toLowerCase().includes('wrong')) {
        toast.warning('Captcha incorrect', 'Please try again')
        setCaptchaSolution('')
        await loadCaptcha(cnrNumber)
        return
      }
      setErrorMsg(msg)
      setStep('error')
    }
  }

  const handleReset = () => {
    setStep('idle')
    setResult(null)
    setErrorMsg('')
    setCaptchaSolution('')
    setCaptchaImg('')
    setSessionId('')
  }

  return (
    <>
      <div className="max-w-lg mx-auto space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold font-display text-text-primary">Check Case Status</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Look up any court case by CNR number without tracking it
          </p>
        </div>

        {/* Search form */}
        <div className="bg-surface-1 border border-border rounded-xl p-5 space-y-4">
          <div className="flex gap-2 p-3 bg-accent/5 border border-accent/15 rounded-lg text-sm text-text-secondary">
            <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
            <p>Enter a CNR number to see real-time case details from the court portal.</p>
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
              loading={captchaLoading}
              variant={step !== 'idle' ? 'outline' : 'primary'}
              className="shrink-0 self-start mt-[22px]"
            >
              {step !== 'idle' ? 'Clear' : 'Search'}
            </Button>
          </div>
        </div>

        <>
          {step === 'captcha' && (
            <div className="bg-surface-1 border border-border rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-text-primary">Enter CAPTCHA</h2>
              <div className="flex flex-col items-center gap-3">
                <div className="bg-white rounded-lg border border-border p-1">
                  <img
                    src={`data:image/png;base64,${captchaImg}`}
                    alt="CAPTCHA"
                    className="h-14 object-contain"
                    width="140"
                    height="56"
                  />
                </div>
                <button
                  onClick={() => loadCaptcha(cnr.trim().toUpperCase())}
                  disabled={captchaLoading}
                  className="flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${captchaLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              <Input
                placeholder="Type the characters above"
                value={captchaSolution}
                onChange={(e) => setCaptchaSolution(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCaptchaSubmit()}
                autoFocus
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
              <Button className="w-full" onClick={handleCaptchaSubmit}>
                Look Up Case
              </Button>
            </div>
          )}

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
              alreadyTracking={trackedCnrs.has(result.cnrNumber)}
              onTrack={() => setAddModalOpen(true)}
            />
          )}
        </>
      </div>

      <AddCaseModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdded={(c) => {
          setTrackedCnrs((p) => new Set([...p, c.cnrNumber]))
          toast.success('Now tracking case')
        }}
      />
    </>
  )
}
