import React, { useState } from 'react'
import { Scale, RefreshCw, AlertCircle, Info } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { casesApi } from '@/api'
import { toast } from '@/store/toastStore'
import { cn, extractError, isHighCourtCNR } from '@/lib/utils'
import type { CaseResponse } from '@/types'

interface AddCaseModalProps {
  open: boolean
  onClose: () => void
  onAdded: (c: CaseResponse) => void
}

type Step = 'cnr' | 'captcha' | 'loading'

export const AddCaseModal: React.FC<AddCaseModalProps> = ({ open, onClose, onAdded }) => {
  const [step, setStep] = useState<Step>('cnr')
  const [cnr, setCnr] = useState('')
  const [cnrError, setCnrError] = useState('')
  const [captchaImageBase64, setCaptchaImageBase64] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [captchaSolution, setCaptchaSolution] = useState('')
  const [captchaError, setCaptchaError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const reset = () => {
    setStep('cnr')
    setCnr('')
    setCnrError('')
    setCaptchaImageBase64('')
    setSessionId('')
    setCaptchaSolution('')
    setCaptchaError('')
    setSubmitting(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const validateCnr = (value: string) => {
    const trimmed = value.trim().toUpperCase()
    if (!trimmed) return 'CNR number is required'
    if (!/^[A-Z]{4}[0-9]{12}$/.test(trimmed))
      return 'Format: 4 letters + 12 digits (e.g. UPST010058262024)'
    return ''
  }

  // Step 1 — submit CNR
  const handleCnrSubmit = async () => {
    const val = cnr.trim().toUpperCase()
    const err = validateCnr(val)
    if (err) { setCnrError(err); return }
    setCnrError('')

    const isHC = isHighCourtCNR(val)

    if (isHC) {
      // High court — no captcha needed, go straight to add
      await submitCase(val, undefined, undefined)
    } else {
      // District court — fetch captcha first
      setSubmitting(true)
      try {
        const res = await casesApi.getCaptcha(val)
        if (res.data.success && res.data.data) {
          setCaptchaImageBase64(res.data.data.captchaImageBase64)
          setSessionId(res.data.data.sessionId)
          setStep('captcha')
        } else {
          toast.error('Failed to load captcha', res.data.error ?? undefined)
        }
      } catch (e) {
        toast.error('Failed to load captcha', extractError(e))
      } finally {
        setSubmitting(false)
      }
    }
  }

  const handleRefreshCaptcha = async () => {
    setSubmitting(true)
    setCaptchaSolution('')
    try {
      const res = await casesApi.getCaptcha(cnr.trim().toUpperCase())
      if (res.data.success && res.data.data) {
        setCaptchaImageBase64(res.data.data.captchaImageBase64)
        setSessionId(res.data.data.sessionId)
      }
    } catch (e) {
      toast.error('Failed to refresh captcha', extractError(e))
    } finally {
      setSubmitting(false)
    }
  }

  // Step 2 — submit with captcha
  const handleCaptchaSubmit = async () => {
    if (!captchaSolution.trim()) {
      setCaptchaError('Enter the captcha text')
      return
    }
    setCaptchaError('')
    await submitCase(cnr.trim().toUpperCase(), sessionId, captchaSolution.trim())
  }

  const submitCase = async (cnrNumber: string, sid?: string, solution?: string) => {
    setSubmitting(true)
    setStep('loading')
    try {
      const payload = sid && solution
        ? { cnrNumber, sessionId: sid, captchaSolution: solution }
        : { cnrNumber }

      const res = await casesApi.addCase(payload)
      if (res.data.success && res.data.data) {
        toast.success('Case added', `Now tracking ${cnrNumber}`)
        onAdded(res.data.data)
        handleClose()
      } else {
        throw new Error(res.data.error ?? 'Failed to add case')
      }
    } catch (e) {
      const msg = extractError(e)
      if (msg.toLowerCase().includes('captcha') || msg.toLowerCase().includes('wrong')) {
        setCaptchaError('Captcha incorrect — try again')
        setStep('captcha')
      } else {
        toast.error('Could not add case', msg)
        handleClose()
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Track a Case"
      description="Enter a CNR number to start tracking"
      size="sm"
    >
      {step === 'cnr' && (
        <div className="space-y-5">
          {/* CNR info */}
          <div className="flex gap-3 p-3 bg-accent/5 border border-accent/15 rounded-lg text-sm text-text-secondary">
            <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
            <p>
              CNR = 4 letters + 12 digits. District courts (e.g. UPST…) need a captcha.
              High courts (e.g. UPHC…, DLHC…) are added instantly.
            </p>
          </div>

          <Input
            label="CNR Number"
            placeholder="e.g. UPST010058262024"
            value={cnr}
            onChange={(e) => {
              setCnr(e.target.value.toUpperCase())
              if (cnrError) setCnrError('')
            }}
            error={cnrError}
            icon={<Scale />}
            onKeyDown={(e) => e.key === 'Enter' && handleCnrSubmit()}
            autoFocus
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
          />

          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              loading={submitting}
              onClick={handleCnrSubmit}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 'captcha' && (
        <div className="space-y-5">
          <div className="text-sm text-text-secondary">
            Solve the CAPTCHA from eCourts to verify case{' '}
            <span className="font-mono text-text-primary">{cnr}</span>
          </div>

          {/* Captcha image */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative bg-white rounded-lg overflow-hidden border border-border p-1">
              <img
                src={`data:image/png;base64,${captchaImageBase64}`}
                alt="CAPTCHA"
                className="h-16 object-contain"
                width="160"
                height="64"
              />
            </div>
            <button
              type="button"
              onClick={handleRefreshCaptcha}
              disabled={submitting}
              className="flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', submitting && 'animate-spin')} />
              Refresh captcha
            </button>
          </div>

          <Input
            label="Enter the characters you see"
            placeholder="Type captcha here"
            value={captchaSolution}
            onChange={(e) => {
              setCaptchaSolution(e.target.value)
              if (captchaError) setCaptchaError('')
            }}
            error={captchaError}
            onKeyDown={(e) => e.key === 'Enter' && handleCaptchaSubmit()}
            autoFocus
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />

          {captchaError && (
            <div className="flex items-center gap-2 text-sm text-warning">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Incorrect — refresh the captcha and try again.
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => setStep('cnr')}>
              Back
            </Button>
            <Button
              className="flex-1"
              loading={submitting}
              onClick={handleCaptchaSubmit}
            >
              Add Case
            </Button>
          </div>
        </div>
      )}

      {step === 'loading' && (
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-text-primary">Fetching case data</p>
            <p className="text-sm text-text-secondary mt-0.5">Connecting to court portal…</p>
          </div>
        </div>
      )}
    </Modal>
  )
}
