import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, User, Phone, KeyRound, Info } from 'lucide-react'
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

type RegisterStep = 'register' | 'otp'

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { theme } = useThemeStore()

  useSeo({
    title: 'Create Account',
    description: 'Sign up for a CourTier account to track court cases, set custom notification preferences, and get real-time case alerts.',
  })

  const [step, setStep] = useState<RegisterStep>('register')
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    otp: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [field]: e.target.value }))
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (step === 'register') {
      if (!form.fullName.trim()) e.fullName = 'Name is required'
      if (!form.email.trim()) e.email = 'Email is required'
      else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email'
      if (!form.password) e.password = 'Password is required'
      else if (form.password.length < 8) e.password = 'At least 8 characters'
      if (form.phone && !/^[6-9]\d{9}$/.test(form.phone))
        e.phone = 'Invalid Indian phone number'
    } else if (!form.otp.trim()) {
      e.otp = 'OTP is required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError('')
    if (!validate()) return

    setLoading(true)
    try {
      if (step === 'register') {
        const res = await authApi.register({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim() || undefined,
        })
        if (res.data.success) {
          toast.success('OTP Sent!', 'Check your email for the verification code.')
          setStep('otp')
        } else {
          setApiError(res.data.error ?? 'Registration failed')
        }
      } else {
        const res = await authApi.verifyEmail({
          email: form.email.trim(),
          otp: form.otp.trim(),
        })
        const auth = normalizeAuthResponse(res.data.data)
        if (res.data.success && auth) {
          toast.success('Success', 'Account verified successfully!')
          login(auth)
          navigate('/dashboard', { replace: true })
        } else {
          setApiError(res.data.error ?? 'Verification failed')
        }
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
          <h2 className="text-base font-semibold text-text-primary mb-5">
            {step === 'register' ? 'Create your account' : 'Verify your email'}
          </h2>

          {apiError && (
            <div className="mb-4 px-3 py-2.5 bg-danger/10 border border-danger/20 rounded-lg text-sm text-danger">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 'register' ? (
              <>
                <Input
                  label="Full Name"
                  placeholder="Rahul Sharma"
                  value={form.fullName}
                  onChange={set('fullName')}
                  error={errors.fullName}
                  icon={<User />}
                  autoComplete="name"
                  autoFocus
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set('email')}
                  error={errors.email}
                  icon={<Mail />}
                  autoComplete="email"
                />
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={set('password')}
                  error={errors.password}
                  icon={<Lock />}
                  iconRight={showPassword ? <EyeOff /> : <Eye />}
                  onIconRightClick={() => setShowPassword((p) => !p)}
                  autoComplete="new-password"
                />
                <Input
                  label="Phone (optional)"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={set('phone')}
                  error={errors.phone}
                  icon={<Phone />}
                  hint="Indian mobile numbers only"
                  autoComplete="tel"
                />
              </>
            ) : (
              <>
                <p className="text-sm text-text-secondary">
                  Enter the 6-digit code sent to{' '}
                  <span className="font-medium text-text-primary">{form.email}</span>
                </p>
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
                <button
                  type="button"
                  onClick={() => setStep('register')}
                  className="text-sm text-text-muted hover:text-accent transition-colors"
                >
                  ← Back to registration
                </button>
              </>
            )}

            <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
              {step === 'register' ? 'Create Account' : 'Verify & Continue'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-text-muted mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:text-accent-hover transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
