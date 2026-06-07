import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Compass, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useSeo } from '@/hooks/useSeo'

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()

  useSeo({
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist or has been moved.',
  })

  return (
    <div className="min-h-dvh bg-surface-0 flex flex-col items-center justify-center px-4 text-center">
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/5 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-md w-full bg-surface-1 border border-border rounded-2xl p-8 shadow-card">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-5">
          <Compass className="h-7 w-7" />
        </div>

        <span className="text-[11px] font-bold text-accent uppercase tracking-widest font-mono">Error 404</span>
        <h1 className="text-xl font-semibold text-text-primary font-display mt-2">Page not found</h1>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          The page you are looking for doesn't exist, or has been moved to another URL. Please verify the web address and try again.
        </p>

        <div className="mt-8">
          <Button
            className="w-full"
            icon={<ArrowLeft />}
            onClick={() => navigate('/', { replace: true })}
            size="lg"
          >
            Go Back Home
          </Button>
        </div>
      </div>
    </div>
  )
}
