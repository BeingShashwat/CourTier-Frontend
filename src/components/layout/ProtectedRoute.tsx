import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { AppShell } from '@/components/layout/AppShell'

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, hydrated } = useAuthStore()

  if (!hydrated) {
    return (
      <div className="min-h-dvh bg-surface-0 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

export const PublicRoute: React.FC = () => {
  const { isAuthenticated, hydrated } = useAuthStore()

  if (!hydrated) {
    return (
      <div className="min-h-dvh bg-surface-0 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
