import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { authApi } from '@/api'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { extractError, normalizeAuthResponse } from '@/lib/utils'
import { brandIcons } from '@/lib/brand'
import { useSeo } from '@/hooks/useSeo'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuthStore()
  const { theme } = useThemeStore()

  useSeo({
    title: 'Sign In',
    description: 'Log in to your CourTier account to track your court cases, view upcoming hearings, and manage subscriptions.',
  })

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // FIX 1 — Redirect via effect so it fires *after* the store update
  // is committed and any route guards have reconciled. Calling navigate()
  // immediately after login() can race with guards that read the old
  // isAuthenticated value from a stale closure.
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // FIX 2 — Auto-dismiss error after 5 s so it never lingers forever,
  // and clear any pending timer when a new error is set.
  const showError = (msg: string) => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
    setError(msg)
    errorTimerRef.current = setTimeout(() => setError(''), 5000)
  }

  // Clean up timer on unmount
  useEffect(() => () => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) { showError('Email is required'); return }
    if (!password)     { showError('Password is required'); return }

    setLoading(true)
    try {
      const res = await authApi.login({ email: email.trim(), password })
      const auth = normalizeAuthResponse(res.data.data)
      if (res.data.success && auth) {
        login(auth)
        // Navigation is handled by the isAuthenticated useEffect above —
        // no navigate() call here prevents the race condition.
      } else {
        showError(res.data.error ?? 'Login failed — invalid response from server')
      }
    } catch (e) {
      showError(extractError(e))
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
          <h2 className="text-base font-semibold text-text-primary mb-5">Sign in to your account</h2>

          {/* FIX 2 — animate-in so the error feels intentional, not a flicker */}
          {error && (
            <div className="mb-4 px-3 py-2.5 bg-danger/10 border border-danger/20 rounded-lg text-sm text-danger animate-in slide-in-from-top-1 duration-200">
              {error}
            </div>
          )}

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

            <div className="space-y-1">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock />}
                iconRight={showPassword ? <EyeOff /> : <Eye />}
                onIconRightClick={() => setShowPassword((p) => !p)}
                autoComplete="current-password"
              />
              {/* FIX 3 — Forgot password link */}
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-xs text-text-muted hover:text-accent transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              loading={loading}
              disabled={loading}
            >
              Sign in
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-text-muted mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent hover:text-accent-hover transition-colors font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}