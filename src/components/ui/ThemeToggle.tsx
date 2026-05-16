import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/store/themeStore'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, toggle } = useThemeStore()

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className={cn(
        'h-9 w-9 rounded-lg flex items-center justify-center',
        'text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors duration-150',
        className
      )}
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
