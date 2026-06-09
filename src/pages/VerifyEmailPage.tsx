import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, KeyRound, ArrowLeft, Info } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { authApi } from '@/api'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { toast } from '@/store/toastStore'
import { extractError, normalizeAuthResponse } from '@/lib/utils'
import { brandIcons } from '@/lib/brand'
import { useSeo } from '@/hooks/useSeo'

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { theme } = useThemeStore()
  const [searchParams] = useSearchParams()

  useSeo({
    title: 'Verify Email',
    description: 'Verify your CourTier account email address with the OTP verification code.',
  })

  const [form, setForm] = useState({
    email: '',
    otp: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setForm((p) => ({ ...p, email: emailParam }))
    }
  }, [searchParams])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email'
    if (!form.otp.trim()) e.otp = 'Verification code is required'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [field]: e.target.value }))
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError('')
    if (!validate()) return

    setLoading(true)
    try {
      const res = await authApi.verifyEmail({
        email: form.email.trim(),
        otp: form.otp.trim(),
      })
      const auth = normalizeAuthResponse(res.data.data)
      if (res.data.success && auth) {
        toast.success('Email Verified', 'Your account has been successfully verified.')
        login(auth)
        navigate('/dashboard', { replace: true })
      } else {
        setApiError(res.data.error ?? 'Verification failed')
      }
    } catch (err) {
      setApiError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-surface-0 flex flex-col items-center justify-center px-4 py-12">
      <div className="fixed top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/5 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img
            src={brandIcons.stackedLockup(theme)}
            alt="CourTier"
            className="h-28 w-28 object-contain rounded-2xl"
            width="112"
            height="112"
          />
        </div>

        <div className="bg-surface-1 border border-border rounded-2xl p-6 shadow-card">
          <h2 className="text-base font-semibold text-text-primary mb-3">
            Verify your email
          </h2>
          <p className="text-sm text-text-secondary mb-5">
            Enter the 6-digit verification code sent to your email.
          </p>

          {apiError && (
            <div className="mb-4 px-3 py-2.5 bg-danger/10 border border-danger/20 rounded-lg text-sm text-danger animate-in slide-in-from-top-1 duration-200">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              error={errors.email}
              icon={<Mail />}
              autoComplete="email"
            />

            <Input
              label="Verification Code"
              placeholder="Enter OTP"
              value={form.otp}
              onChange={set('otp')}
              error={errors.otp}
              icon={<KeyRound />}
              autoFocus
              autoComplete="one-time-code"
            />

            <div className="flex gap-2.5 p-3.5 bg-accent/5 border border-accent/15 rounded-lg text-xs text-text-secondary leading-relaxed">
              <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-text-primary">Didn't receive the email?</p>
                <p className="mt-0.5">Check spam/junk folder if the email is not visible.</p>
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
              Verify &amp; Continue
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-text-muted mt-5">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-accent hover:text-accent-hover transition-colors font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
