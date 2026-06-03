import React, { useEffect, useState } from 'react'
import { Download, X, Share2, PlusSquare, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export const PwaInstallBanner: React.FC = () => {
  const [show, setShow] = useState(false)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other')
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // 1. Check if already installed / running in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true

    if (isStandalone) return

    // 2. Check if user has dismissed it
    const isDismissed = localStorage.getItem('courtier-pwa-dismissed') === 'true'
    if (isDismissed) return

    // 3. Platform check
    const ua = navigator.userAgent.toLowerCase()
    const isIos = /iphone|ipad|ipod/.test(ua)
    const isAndroid = /android/.test(ua)
    const isMobile = isIos || isAndroid || window.innerWidth < 768

    if (!isMobile) return

    if (isIos) {
      setPlatform('ios')
    } else if (isAndroid) {
      setPlatform('android')
    }

    // 4. Capture native install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // For iOS, beforeinstallprompt is never supported but PWA is.
    // For some Android browsers, beforeinstallprompt might not fire instantly,
    // so we can display the custom guidance after a small delay.
    if (isIos || isAndroid) {
      const timer = setTimeout(() => {
        setShow(true)
      }, 2000)
      return () => {
        clearTimeout(timer)
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShow(false)
      }
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('courtier-pwa-dismissed', 'true')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="bg-surface-1 border border-accent/20 rounded-xl p-4 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-accent/10 rounded-lg text-accent shrink-0">
          <Download className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-text-primary">Install CourTier App</h4>
          <p className="text-xs text-text-secondary mt-0.5 max-w-md">
            Add CourTier to your home screen for instant access, offline support, and a fast native-like experience.
          </p>

          {/* Contextual Instructions */}
          {platform === 'ios' && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-accent">
              <Share2 className="h-3.5 w-3.5" />
              <span>Tap the share button, then select <strong>'Add to Home Screen'</strong></span>
              <PlusSquare className="h-3.5 w-3.5" />
            </div>
          )}

          {platform === 'android' && !deferredPrompt && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-accent">
              <MoreVertical className="h-3.5 w-3.5" />
              <span>Tap the browser menu (3 dots) and select <strong>'Add to Home Screen'</strong></span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
        {deferredPrompt ? (
          <Button size="sm" onClick={handleInstallClick} className="px-4">
            Install
          </Button>
        ) : null}
        <Button size="sm" variant="ghost" onClick={handleDismiss} className="text-text-muted hover:text-text-primary">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
