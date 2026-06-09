import React, { useState } from 'react'
import { Scale, Info } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { casesApi } from '@/api'
import { toast } from '@/store/toastStore'
import { extractError } from '@/lib/utils'
import type { CaseResponse } from '@/types'

interface AddCaseModalProps {
  open: boolean
  onClose: () => void
  onAdded: (c: CaseResponse) => void
}

export const AddCaseModal: React.FC<AddCaseModalProps> = ({ open, onClose, onAdded }) => {
  const [cnr, setCnr] = useState('')
  const [cnrError, setCnrError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const reset = () => {
    setCnr('')
    setCnrError('')
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

    await submitCase(val)
  }

  const submitCase = async (cnrNumber: string) => {
    setSubmitting(true)
    try {
      const res = await casesApi.addCase({ cnrNumber })
      if (res.data.success && res.data.data) {
        toast.success('Case added', `Now tracking ${cnrNumber}`)
        onAdded(res.data.data)
        handleClose()
      } else {
        throw new Error(res.data.error ?? 'Failed to add case')
      }
    } catch (e) {
      toast.error('Could not add case', extractError(e))
      handleClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Track a Case"
      description="Enter a CNR number to look up and track it"
      size="sm"
    >
      <div className="space-y-5">
        <div className="flex gap-3 p-3 bg-accent/5 border border-accent/15 rounded-lg text-sm text-text-secondary">
          <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <p>
            CNR = 4 letters + 12 digits. Enter the full number exactly as shown on the case record.
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
    </Modal>
  )
}
