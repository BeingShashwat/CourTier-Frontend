import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Bell, Scale, Search, Shield } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { brandIcons } from '@/lib/brand'
import { useSeo } from '@/hooks/useSeo'

const features = [
  {
    icon: <Scale className="h-6 w-6" />,
    title: 'Track Any Court Case',
    description:
      'Support for district courts and high courts across India. Enter a CNR number and start tracking instantly.',
  },
  {
    icon: <Bell className="h-6 w-6" />,
    title: 'Hearing Alerts',
    description:
      'Get notified about upcoming hearings. Never miss a date with real-time updates from eCourts.',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Secure & Private',
    description:
      'Your tracked cases are encrypted and private. Only you can see your dashboard and case data.',
  },
  {
    icon: <Search className="h-6 w-6" />,
    title: 'Quick Status Check',
    description:
      'Look up any case instantly without creating an account. Just enter the CNR and get full details.',
  },
]

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore()
  const { theme } = useThemeStore()

  useSeo({
    title: 'India\'s Intelligent eCourts Case Tracker',
    description: 'CourTier tracks Indian District Courts and High Courts. Start tracking case timelines, orders, and hearing dates with real-time alerts.',
    jsonLd: {
      '@type': 'WebApplication',
      'name': 'CourTier',
      'applicationCategory': 'BusinessApplication',
      'operatingSystem': 'All',
      'description': 'Intelligent court case tracking platform for Indian District and High Courts.',
    }
  })

  return (
    <div className="min-h-dvh bg-surface-0 text-text-primary flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface-0/80 backdrop-blur-md border-b border-border safe-pt">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <img
            src={brandIcons.horizontalLockup(theme)}
            alt="CourTier"
            className="h-7 object-contain"
            width="120"
            height="28"
          />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 h-9 px-4 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors"
              >
                Dashboard
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="h-9 px-4 inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 h-9 px-4 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-accent/5 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
          <div className="mb-8">
            <img
              src={brandIcons.appIcon(theme)}
              alt="CourTier"
              className="h-24 w-24 rounded-2xl shadow-card"
              width="96"
              height="96"
            />
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold font-display leading-tight tracking-tight">
            Track Every Hearing.
            <br />
            <span className="accent-gradient">Miss Nothing.</span>
          </h1>

          <p className="mt-5 text-lg text-text-secondary max-w-lg leading-relaxed">
            CourTier connects to India's eCourts system to give you real-time case status updates,
            hearing alerts, and complete case histories — all in one place.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 h-12 px-8 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-all shadow-glow-sm hover:shadow-glow"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 h-12 px-8 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-all shadow-glow-sm hover:shadow-glow"
                >
                  Start Tracking — Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 h-12 px-8 border border-border text-text-secondary font-medium rounded-xl hover:border-border-strong hover:text-text-primary hover:bg-surface-2 transition-all"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          <p className="mt-6 text-sm text-text-muted">
            Free to use · No credit card required · Works with all Indian courts
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 bg-surface-1 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-text-primary">
              Everything you need to stay on top of your cases
            </h2>
            <p className="mt-3 text-text-secondary max-w-lg mx-auto">
              Whether you're a lawyer, litigant, or legal researcher — CourTier simplifies court case tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-surface-0 border border-border rounded-xl p-6 hover:border-border-strong hover:shadow-card transition-all duration-200"
              >
                <div className="inline-flex p-2.5 rounded-lg bg-accent/10 text-accent mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-1.5">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section className="px-4 py-16 bg-surface-0 border-t border-border">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-text-primary mb-3">
              Ready to simplify your case tracking?
            </h2>
            <p className="text-text-secondary mb-6">
              Join CourTier today and never miss another hearing date.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 h-12 px-8 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-all shadow-glow-sm hover:shadow-glow"
            >
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="px-4 py-6 border-t border-border bg-surface-1 safe-pb">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <img
            src={brandIcons.horizontalLockup(theme)}
            alt="CourTier"
            className="h-5 object-contain opacity-60"
            width="85"
            height="20"
          />
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} CourTier. Track Every Hearing. Miss Nothing.
          </p>
        </div>
      </footer>
    </div>
  )
}
