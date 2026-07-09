import { create } from 'zustand'

export type Theme = 'dark' | 'light'

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.remove('dark', 'light')
  root.classList.add(theme)

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', theme === 'dark' ? '#0a0b0f' : '#f5f6fa')
  }
}

const stored = (localStorage.getItem('theme') as Theme | null) ?? 'light'
applyTheme(stored)

interface ThemeState {
  theme: Theme
  toggle: () => void
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: stored,

  toggle: () => {
    set((state) => {
      const next: Theme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', next)
      applyTheme(next)
      return { theme: next }
    })
  },

  setTheme: (theme) => {
    localStorage.setItem('theme', theme)
    applyTheme(theme)
    set({ theme })
  },
}))
