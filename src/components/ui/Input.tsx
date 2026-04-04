import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
  iconRight?: React.ReactNode
  onIconRightClick?: () => void
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, iconRight, onIconRightClick, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-medium text-text-secondary tracking-wide"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3 text-text-muted [&>svg]:h-4 [&>svg]:w-4 pointer-events-none">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full bg-surface-2 border rounded text-text-primary placeholder:text-text-muted text-sm',
              'h-10 px-3 transition-all duration-150 outline-none',
              'focus:border-accent/60 focus:bg-surface-2 focus:ring-2 focus:ring-accent/10',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-danger/50 focus:border-danger/60 focus:ring-danger/10'
                : 'border-border hover:border-border-strong',
              icon && 'pl-9',
              iconRight && 'pr-10',
              className
            )}
            {...props}
          />

          {iconRight && (
            <button
              type="button"
              onClick={onIconRightClick}
              className="absolute right-3 text-text-muted hover:text-text-secondary transition-colors [&>svg]:h-4 [&>svg]:w-4"
            >
              {iconRight}
            </button>
          )}
        </div>

        {error && (
          <p className="text-[12px] text-danger flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-[12px] text-text-muted">{hint}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
