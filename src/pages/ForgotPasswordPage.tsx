import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, Info } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { authApi } from '@/api'
import { useThemeStore } from '@/store/themeStore'
import { toast } from '@/store/toastStore'
import { extractError } from '@/lib/utils'
import { brandIcons } from '@/lib/brand'
import { useSeo } from '@/hooks/useSeo'

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const { theme } = useThemeStore()

  useSeo({
    title: 'Forgot Password',
    description: 'Reset your CourTier account password by requesting an OTP verification code.',
  })

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('Email is required')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError('Invalid email address')
      return
    }

    setLoading(true)
    try {
      const res = await authApi.forgotPassword(trimmedEmail)
      if (res.data.success) {
        toast.success('Reset Code Sent', 'Check your email for the verification code.')
        setSuccess(true)
      } else {
        setError(res.data.error ?? 'Could not process forgot password request')
      }
    } catch (err) {
      setError(extractError(err))
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
            {success ? 'Check your email' : 'Reset password'}
          </h2>
          <p className="text-sm text-text-secondary mb-5">
            {success
              ? `We have sent a verification code to ${email}`
              : 'Enter your email address and we will send you a code to reset your password.'}
          </p>

          {error && (
            <div className="mb-4 px-3 py-2.5 bg-danger/10 border border-danger/20 rounded-lg text-sm text-danger animate-in slide-in-from-top-1 duration-200">
              {error}
            </div>
          )}

          {success ? (
            <div className="space-y-6">
              <div className="flex gap-2.5 p-3.5 bg-accent/5 border border-accent/15 rounded-lg text-[13px] text-text-secondary leading-relaxed animate-in fade-in duration-200">
                <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-text-primary">Email verification flow</p>
                  <p className="mt-1 text-xs">
                    Didn't receive the email? Check spam/junk folder if the email is not visible.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
                  className="w-full"
                  size="lg"
                >
                  Verify &amp; Reset Password
                </Button>
                <Button variant="ghost" onClick={() => setSuccess(false)} className="w-full">
                  Change email address
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail />}
                autoComplete="email"
                autoFocus
              />

              <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
                Send Code
              </Button>
            </form>
          )}
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
