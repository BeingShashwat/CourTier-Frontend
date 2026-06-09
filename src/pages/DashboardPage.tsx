import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Scale,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  AlertTriangle,
  ArrowRight,
  Bell,
  Search,
  RefreshCw,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { casesApi, notificationsApi } from '@/api'
import { CaseCard } from '@/components/case/CaseCard'
import { AddCaseModal } from '@/components/case/AddCaseModal'
import { PwaInstallBanner } from '@/components/layout/PwaInstallBanner'
import { Button } from '@/components/ui/Button'
import { CaseCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from '@/store/toastStore'
import { daysUntil, extractError, timeAgo } from '@/lib/utils'
import type { CaseResponse, CourtNotification } from '@/types'
import { useSeo } from '@/hooks/useSeo'

const StatCard: React.FC<{
  icon: React.ReactNode
  label: string
  value: number | string
  sub?: string
  accent?: boolean
}> = ({ icon, label, value, sub, accent }) => (
  <div className="bg-surface-1 border border-border rounded-xl px-5 py-4 transition-all duration-150 hover:border-border-strong hover:shadow-card">
    <div className={`inline-flex p-2 rounded-lg mb-3 ${accent ? 'bg-accent/10' : 'bg-surface-3'}`}>
      <span className={`[&>svg]:h-4 [&>svg]:w-4 ${accent ? 'text-accent' : 'text-text-secondary'}`}>
        {icon}
      </span>
    </div>
    <p className="text-2xl font-bold text-text-primary font-display">{value}</p>
    <p className="text-[12px] text-text-muted mt-0.5 font-medium uppercase tracking-wider">{label}</p>
    {sub && <p className="text-[12px] text-text-muted mt-1 opacity-70">{sub}</p>}
  </div>
)

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useSeo({
    title: 'Dashboard',
    description: 'Monitor your tracked court cases, view upcoming hearing dates, recent activity updates, and manage notifications in one unified dashboard.',
  })

  const [cases, setCases] = useState<CaseResponse[]>([])
  const [notifications, setNotifications] = useState<CourtNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [notificationsLoading, setNotificationsLoading] = useState(true)
  const [casesError, setCasesError] = useState('')
  const [notificationsError, setNotificationsError] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [refreshingCnr, setRefreshingCnr] = useState<string | null>(null)

  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    setNotificationsLoading(true)
    setCasesError('')
    setNotificationsError('')

    const [casesResult, notificationsResult] = await Promise.allSettled([
      casesApi.getMyCases(),
      notificationsApi.getMyNotifications(),
    ])

    if (casesResult.status === 'fulfilled') {
      if (casesResult.value.data.success && casesResult.value.data.data) {
        setCases(casesResult.value.data.data)
      } else {
        const message = casesResult.value.data.error ?? 'Could not load cases'
        setCasesError(message)
        toast.error('Could not load cases', message)
      }
    } else {
      const message = extractError(casesResult.reason)
      setCasesError(message)
      toast.error('Could not load cases', message)
    }

    if (notificationsResult.status === 'fulfilled') {
      if (notificationsResult.value.data.success && notificationsResult.value.data.data) {
        setNotifications(notificationsResult.value.data.data)
      } else {
        setNotificationsError(notificationsResult.value.data.error ?? 'Could not load notifications')
      }
    } else {
      setNotificationsError(extractError(notificationsResult.reason))
    }

    setLoading(false)
    setNotificationsLoading(false)
  }, [])

  useEffect(() => {
    void loadDashboardData()
  }, [loadDashboardData])

  const handleRefresh = async (cnr: string) => {
    setRefreshingCnr(cnr)
    try {
      const res = await casesApi.pollCase(cnr)
      if (res.data.success && res.data.data) {
        setCases((prev) => prev.map((c) => (c.cnrNumber === cnr ? res.data.data! : c)))
        toast.success('Case refreshed')
        // Refresh notifications to show latest sync info
        const notifsRes = await notificationsApi.getMyNotifications()
        if (notifsRes.data.success && notifsRes.data.data) {
          setNotifications(notifsRes.data.data)
        }
      }
    } catch (e) {
      toast.error('Refresh failed', extractError(e))
    } finally {
      setRefreshingCnr(null)
    }
  }

  const handleRemove = async (cnr: string) => {
    try {
      await casesApi.removeCase(cnr)
      setCases((prev) => prev.filter((c) => c.cnrNumber !== cnr))
      toast.success('Case removed')
    } catch (e) {
      toast.error('Failed to remove case', extractError(e))
    }
  }

  // Calculate statistics
  const pending = cases.filter((c) => c.status === 'PENDING').length
  const disposed = cases.filter((c) => c.status === 'DISPOSED').length
  const upcomingHearings = cases.filter((c) => {
    const d = daysUntil(c.nextHearingDate)
    return d !== null && d >= 0 && d <= 14
  })
  const upcomingCount = upcomingHearings.length
  const urgent = cases.filter((c) => {
    const d = daysUntil(c.nextHearingDate)
    return d !== null && d >= 0 && d <= 3
  }).length

  // Sorting cases by next hearing date urgency
  const sortedCases = [...cases].sort((a, b) => {
    const da = daysUntil(a.nextHearingDate)
    const db = daysUntil(b.nextHearingDate)
    if (da !== null && db !== null) return da - db
    if (da !== null) return -1
    if (db !== null) return 1
    return 0
  })

  const firstName = user?.fullName?.split(' ')[0] ?? 'there'

  return (
    <div className="space-y-6">
      {/* PWA banner */}
      <PwaInstallBanner />

      {/* Greetings + Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-text-primary">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Here's what is happening with your cases today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button icon={<Search />} variant="outline" size="sm" onClick={() => navigate('/check')}>
            Look Up CNR
          </Button>
          <Button icon={<Plus />} size="sm" onClick={() => setAddOpen(true)}>
            Track Case
          </Button>
        </div>
      </div>

      {/* Urgent warnings */}
      {urgent > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-danger/10 border border-danger/20 rounded-xl animate-pulse-slow">
          <AlertTriangle className="h-5 w-5 text-danger shrink-0" />
          <p className="text-sm text-text-primary leading-normal">
            <span className="font-semibold text-danger">{urgent} urgent hearing{urgent > 1 ? 's' : ''}</span> scheduled within the next 3 days. Please review details below.
          </p>
        </div>
      )}

      {/* Stats Cards */}
      {cases.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <StatCard icon={<Scale />} label="Total Tracked" value={cases.length} accent />
          <StatCard icon={<Clock />} label="Pending" value={pending} />
          <StatCard icon={<Calendar />} label="Upcoming (14d)" value={upcomingCount} />
          <StatCard icon={<CheckCircle2 />} label="Disposed" value={disposed} />
        </div>
      )}

      {/* Main Grid: Cases vs Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Case Tracking & Hearings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming hearings breakdown */}
          {upcomingCount > 0 && (
            <div className="bg-surface-1 border border-border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-accent" />
                Upcoming Hearings (Next 14 Days)
              </h2>
              <div className="space-y-3">
                {upcomingHearings.slice(0, 3).map((c) => {
                  const days = daysUntil(c.nextHearingDate)
                  return (
                    <div
                      key={c.cnrNumber}
                      onClick={() => navigate(`/cases/${c.cnrNumber}`)}
                      className="group flex items-center justify-between p-3.5 bg-surface-2 border border-border rounded-lg hover:border-border-strong hover:shadow-glow-sm cursor-pointer transition-all duration-150"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-mono text-accent font-medium">{c.cnrNumber}</p>
                        <h4 className="text-sm font-medium text-text-primary truncate mt-0.5 group-hover:text-accent transition-colors">
                          {c.caseType ?? 'Case Type'}
                        </h4>
                        <p className="text-xs text-text-secondary truncate mt-0.5">
                          {c.petitionerName} vs {c.respondentName}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-text-primary">
                          {c.nextHearingDate ? new Date(c.nextHearingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                        </p>
                        <span
                          className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full mt-1 ${
                            days !== null && days <= 3
                              ? 'bg-danger/10 text-danger'
                              : 'bg-accent/10 text-accent'
                          }`}
                        >
                          {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tracked Cases List */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Recent Tracked Cases
              </h2>
              {cases.length > 3 && (
                <button
                  onClick={() => navigate('/cases')}
                  className="text-xs font-semibold text-accent hover:text-accent-hover inline-flex items-center gap-1 transition-colors"
                >
                  View all cases
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <CaseCardSkeleton key={i} />
                ))}
              </div>
            ) : casesError ? (
              <EmptyState
                icon={<AlertTriangle />}
                title="Could not load cases"
                description={casesError}
                action={
                  <Button variant="outline" onClick={loadDashboardData}>
                    Retry
                  </Button>
                }
              />
            ) : sortedCases.length === 0 ? (
              <EmptyState
                icon={<Scale />}
                title="No cases tracked yet"
                description="Add your first case to get real-time eCourts updates, notifications, and analytics."
                action={
                  <Button icon={<Plus />} onClick={() => setAddOpen(true)}>
                    Track your first case
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {sortedCases.slice(0, 3).map((c, i) => (
                  <CaseCard
                    key={c.cnrNumber}
                    case_={c}
                    index={i}
                    onRefresh={handleRefresh}
                    onRemove={handleRemove}
                    refreshing={refreshingCnr === c.cnrNumber}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick actions & Recent updates */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-surface-1 border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => setAddOpen(true)}
                className="w-full flex items-center justify-between p-3 bg-surface-2 border border-border rounded-lg text-left hover:border-accent/30 hover:bg-surface-2/65 transition-all group"
              >
                <div>
                  <h4 className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
                    Track New Case
                  </h4>
                  <p className="text-[11px] text-text-secondary mt-0.5">Start monitoring a CNR number</p>
                </div>
                <Plus className="h-4 w-4 text-text-muted group-hover:text-accent transition-colors" />
              </button>

              <button
                onClick={() => navigate('/check')}
                className="w-full flex items-center justify-between p-3 bg-surface-2 border border-border rounded-lg text-left hover:border-accent/30 hover:bg-surface-2/65 transition-all group"
              >
                <div>
                  <h4 className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
                    Quick Case Lookup
                  </h4>
                  <p className="text-[11px] text-text-secondary mt-0.5">Look up a case by CNR number</p>
                </div>
                <Search className="h-4 w-4 text-text-muted group-hover:text-accent transition-colors" />
              </button>
            </div>
          </div>

          {/* Recent Activity / Notifications Widget */}
          <div className="bg-surface-1 border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Bell className="h-4 w-4 text-accent" />
                Recent Updates
              </h3>
              <button
                onClick={loadDashboardData}
                disabled={notificationsLoading}
                className="text-text-muted hover:text-text-primary disabled:opacity-50 transition-colors"
                title="Refresh updates"
                aria-label="Refresh updates"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${notificationsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {notificationsLoading ? (
              <div className="space-y-4 py-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="h-7 w-7 rounded-full bg-surface-2 shrink-0" />
                    <div className="flex-1 space-y-1.5 py-0.5">
                      <div className="h-3.5 bg-surface-2 rounded w-3/4" />
                      <div className="h-2.5 bg-surface-2 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notificationsError ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-danger/20 bg-danger/5">
                  <AlertTriangle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">Updates unavailable</p>
                    <p className="text-xs text-text-secondary mt-0.5 break-words">{notificationsError}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={loadDashboardData}>
                  Retry
                </Button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="h-8 w-8 text-text-muted/40 mx-auto mb-2.5" />
                <p className="text-xs text-text-muted font-medium">All caught up!</p>
                <p className="text-[11px] text-text-muted mt-0.5">No updates recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="max-h-[350px] overflow-y-auto pr-1 space-y-4">
                  {notifications.slice(0, 8).map((n) => {
                    const isHearingChange = n.changeType?.includes('HEARING')
                    const isStatusChange = n.changeType?.includes('STATUS')

                    return (
                      <div
                        key={n.id}
                        onClick={() => navigate(`/cases/${n.cnrNumber}`)}
                        className="flex gap-3 text-left group cursor-pointer"
                      >
                        <div
                          className={`h-7 w-7 rounded-full shrink-0 flex items-center justify-center border text-[11px] font-semibold mt-0.5 ${
                            isHearingChange
                              ? 'bg-accent/15 border-accent/25 text-accent'
                              : isStatusChange
                              ? 'bg-success/15 border-success/25 text-success'
                              : 'bg-surface-3 border-border text-text-secondary'
                          }`}
                        >
                          {isHearingChange ? '📅' : isStatusChange ? '⚖️' : '🔔'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-text-secondary font-mono tracking-wide group-hover:text-accent transition-colors">
                            {n.cnrNumber}
                          </p>
                          <p className="text-[12px] text-text-primary leading-normal mt-0.5 break-words">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-text-muted mt-1 block">
                            {timeAgo(n.createdAt)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddCaseModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={(c) => setCases((prev) => [c, ...prev])}
      />
    </div>
  )
}
