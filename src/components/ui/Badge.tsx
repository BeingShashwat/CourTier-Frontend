import React from 'react'
import { cn, statusClass, statusLabel } from '@/lib/utils'
import type { CaseStatus } from '@/types'

interface BadgeProps {
  status: CaseStatus | string
  className?: string
  size?: 'sm' | 'md'
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, className, size = 'md' }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full tracking-wide',
        size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        statusClass(status),
        className
      )}
    >
      <span
        className={cn(
          'rounded-full shrink-0',
          size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2',
          status === 'PENDING' && 'bg-warning',
          status === 'DISPOSED' && 'bg-success',
          status === 'TRANSFERRED' && 'bg-accent',
          !['PENDING', 'DISPOSED', 'TRANSFERRED'].includes(status as string) && 'bg-text-muted'
        )}
      />
      {statusLabel(status)}
    </span>
  )
}

// Generic badge
interface GenericBadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger'
  className?: string
}

export const Badge: React.FC<GenericBadgeProps> = ({
  children,
  variant = 'default',
  className,
}) => {
  const variantClasses = {
    default: 'bg-surface-3 text-text-secondary border border-border',
    accent: 'bg-accent/10 text-accent border border-accent/20',
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
    danger: 'bg-danger/10 text-danger border border-danger/20',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full tracking-wide',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
