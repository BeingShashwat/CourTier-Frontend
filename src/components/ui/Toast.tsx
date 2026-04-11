import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'
import { cn } from '@/lib/utils'
import type { ToastItem } from '@/types'

const icons = {
  success: <CheckCircle2 className="h-4 w-4 text-success" />,
  error: <AlertCircle className="h-4 w-4 text-danger" />,
  info: <Info className="h-4 w-4 text-accent" />,
  warning: <AlertTriangle className="h-4 w-4 text-warning" />,
}

const styles = {
  success: 'border-success/20 bg-success/5',
  error: 'border-danger/20 bg-danger/5',
  info: 'border-accent/20 bg-accent/5',
  warning: 'border-warning/20 bg-warning/5',
}

const ToastItem_: React.FC<{ toast: ToastItem }> = ({ toast }) => {
  const remove = useToastStore((s) => s.remove)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-lg border shadow-card',
        'bg-surface-1 backdrop-blur-sm min-w-[280px] max-w-[360px] w-full',
        styles[toast.type]
      )}
    >
      <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary leading-tight">{toast.title}</p>
        {toast.message && (
          <p className="text-[12px] text-text-secondary mt-0.5 leading-snug">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => remove(toast.id)}
        className="shrink-0 text-text-muted hover:text-text-secondary transition-colors mt-0.5"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  )
}

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((s) => s.toasts)

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem_ toast={t} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
