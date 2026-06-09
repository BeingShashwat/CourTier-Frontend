import { create } from 'zustand'
import type { AuthResponse } from '@/types'

interface UserInfo {
  email: string
  fullName: string
}

interface AuthState {
  user: UserInfo | null
  accessToken: string | null
  isAuthenticated: boolean
  hydrated: boolean

  login: (auth: AuthResponse) => void
  logout: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  hydrated: false,

  login: (auth: AuthResponse) => {
    if (!auth.accessToken || auth.accessToken === 'undefined' || auth.accessToken === 'null') {
      return
    }
    localStorage.setItem('accessToken', auth.accessToken)
    localStorage.setItem('refreshToken', auth.refreshToken)
    localStorage.setItem('user', JSON.stringify({ email: auth.email, fullName: auth.fullName }))
    set({
      user: { email: auth.email, fullName: auth.fullName },
      accessToken: auth.accessToken,
      isAuthenticated: true,
      hydrated: true,
    })
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    set({ user: null, accessToken: null, isAuthenticated: false, hydrated: true })
  },

  hydrate: () => {
    const token = localStorage.getItem('accessToken')
    const userStr = localStorage.getItem('user')
    if (token && token !== 'undefined' && token !== 'null' && userStr) {
      try {
        const user = JSON.parse(userStr) as UserInfo
        set({ user, accessToken: token, isAuthenticated: true, hydrated: true })
        return
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
      }
    }
    set({ hydrated: true })
  },
}))
