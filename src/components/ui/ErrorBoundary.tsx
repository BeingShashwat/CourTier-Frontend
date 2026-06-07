import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from './Button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo)
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh bg-surface-0 flex flex-col items-center justify-center px-4 text-center">
          <div className="fixed inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
          <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-danger/5 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-md w-full bg-surface-1 border border-border rounded-2xl p-6 shadow-card">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-danger/10 text-danger mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h1 className="text-lg font-semibold text-text-primary font-display">Something went wrong</h1>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              An unexpected error occurred in the application. We've logged the issue and are looking into it.
            </p>

            {this.state.error?.message && (
              <div className="mt-4 p-3 bg-surface-2 border border-border rounded-lg text-left">
                <p className="text-xs font-mono text-danger break-words leading-normal">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1"
                icon={<Home />}
                onClick={this.handleGoHome}
              >
                Go to Home
              </Button>
              <Button
                className="flex-1"
                icon={<RefreshCw />}
                onClick={this.handleReload}
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
