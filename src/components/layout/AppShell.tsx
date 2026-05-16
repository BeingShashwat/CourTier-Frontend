import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Scale,
  Search,
  LogOut,
  ChevronDown,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { brandIcons } from '@/lib/brand'
import { cn, initials } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
  { to: '/cases', icon: <Scale />, label: 'My Cases' },
  { to: '/check', icon: <Search />, label: 'Check Status' },
]

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuthStore()
  const { theme } = useThemeStore()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = React.useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-dvh bg-surface-0 flex flex-col">
      <header className="sticky top-0 z-40 bg-surface-0/80 backdrop-blur-md border-b border-border safe-pt">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <NavLink to="/dashboard" className="flex items-center gap-2 shrink-0">
            <img
              src={brandIcons.horizontalLockup(theme)}
              alt="CourTier"
              className="h-7 object-contain"
              width="120"
              height="28"
            />
          </NavLink>

          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors duration-150',
                    '[&>svg]:h-4 [&>svg]:w-4',
                    isActive
                      ? 'bg-accent/10 text-accent'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                  )
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <div className="relative">
              <button
                onClick={() => setProfileOpen((p) => !p)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-surface-2 transition-colors"
                aria-label={user?.fullName || 'User profile menu'}
              >
                <div className="h-7 w-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-[11px] font-semibold text-accent">
                  {initials(user?.fullName)}
                </div>
                <span className="hidden sm:block text-sm text-text-secondary truncate max-w-[120px]">
                  {user?.fullName?.split(' ')[0]}
                </span>
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 text-text-muted transition-transform duration-200',
                    profileOpen && 'rotate-180'
                  )}
                />
              </button>

              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-20 w-52 bg-surface-1 border border-border rounded-xl shadow-card-hover overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-text-primary truncate">{user?.fullName}</p>
                      <p className="text-[12px] text-text-muted truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-danger hover:bg-danger/5 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {children}
      </main>

      <nav className="sm:hidden sticky bottom-0 z-40 bg-surface-0/90 backdrop-blur-md border-t border-border safe-pb">
        <div className="flex items-center">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                  '[&>svg]:h-5 [&>svg]:w-5',
                  isActive
                    ? 'text-accent'
                    : 'text-text-muted hover:text-text-secondary'
                )
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
