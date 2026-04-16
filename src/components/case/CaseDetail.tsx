import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Scale,
  Calendar,
  MapPin,
  User,
  Hash,
  Clock,
  FileText,
  ChevronDown,
  RefreshCw,
  Trash2,
  ArrowLeft,
  Users,
  AlertTriangle,
  BookOpen,
  Activity,
} from 'lucide-react'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate, formatDateTime, daysUntil, cn, truncate } from '@/lib/utils'
import type { CaseResponse } from '@/types'

interface CaseDetailProps {
  case_: CaseResponse
  onRefresh: () => void
  onRemove: () => void
  onBack: () => void
  refreshing?: boolean
}

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string | null | undefined }> = ({
  icon,
  label,
  value,
}) => (
  <div className="flex items-start gap-3">
    <span className="shrink-0 text-text-muted mt-0.5 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
    <div className="min-w-0">
      <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium mb-0.5">{label}</p>
      <p className="text-sm text-text-primary leading-relaxed">{value || '—'}</p>
    </div>
  </div>
)

export const CaseDetail: React.FC<CaseDetailProps> = ({
  case_,
  onRefresh,
  onRemove,
  onBack,
  refreshing,
}) => {
  const [historyExpanded, setHistoryExpanded] = useState(true)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)

  const days = daysUntil(case_.nextHearingDate)
  const hearingUrgency =
    days !== null ? (days <= 3 ? 'urgent' : days <= 14 ? 'soon' : 'normal') : 'none'

  return (
    <div className="space-y-5">
      {/* Back + actions header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to cases</span>
          <span className="sm:hidden">Back</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw />}
            loading={refreshing}
            onClick={onRefresh}
          >
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 />}
            onClick={() => setShowRemoveConfirm(true)}
          >
            <span className="hidden sm:inline">Untrack</span>
          </Button>
        </div>
      </div>

      {/* Remove confirm */}
      <AnimatePresence>
        {showRemoveConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-danger/5 border border-danger/20 rounded-xl px-4 py-3 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-danger shrink-0" />
              <span className="text-text-secondary">Stop tracking this case?</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" variant="ghost" onClick={() => setShowRemoveConfirm(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="danger" onClick={onRemove}>
                Untrack
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header card */}
      <div className="bg-surface-1 border border-border rounded-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="shrink-0 h-12 w-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Scale className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="font-mono text-sm text-accent font-medium tracking-wide">
                {case_.cnrNumber}
              </p>
              <h1 className="text-lg font-semibold text-text-primary font-display mt-0.5 leading-snug">
                {case_.caseType ?? 'Court Case'}
              </h1>
              {case_.filingNumber && (
                <p className="text-sm text-text-muted mt-0.5">
                  Filing No. {case_.filingNumber}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-row sm:flex-col items-start sm:items-end gap-3">
            <StatusBadge status={case_.status} />
            <div className="flex items-center gap-1 text-[12px] text-text-muted">
              <Users className="h-3 w-3" />
              {case_.trackerCount}/5 tracking
            </div>
          </div>
        </div>

        {/* Next hearing callout */}
        {case_.nextHearingDate && (
          <div
            className={cn(
              'mt-4 rounded-lg px-4 py-3 flex items-center gap-3',
              hearingUrgency === 'urgent'
                ? 'bg-warning/8 border border-warning/20'
                : 'bg-accent/6 border border-accent/15'
            )}
          >
            <Calendar
              className={cn(
                'h-4 w-4 shrink-0',
                hearingUrgency === 'urgent' ? 'text-warning' : 'text-accent'
              )}
            />
            <div>
              <p
                className={cn(
                  'text-sm font-medium',
                  hearingUrgency === 'urgent' ? 'text-warning' : 'text-accent'
                )}
              >
                Next Hearing: {formatDate(case_.nextHearingDate)}
              </p>
              {days !== null && (
                <p className="text-[12px] text-text-muted mt-0.5">
                  {days === 0
                    ? 'Today'
                    : days < 0
                    ? `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`
                    : `In ${days} day${days === 1 ? '' : 's'}`}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Parties */}
      {(case_.petitionerName || case_.respondentName) && (
        <div className="bg-surface-1 border border-border rounded-xl p-5">
          <h2 className="text-[11px] uppercase tracking-wider font-medium text-text-muted mb-4">
            Parties
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {case_.petitionerName && (
              <div>
                <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium mb-1.5">
                  Petitioner
                </p>
                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line">
                  {case_.petitionerName.replace(/;/g, '\n')}
                </p>
              </div>
            )}
            {case_.respondentName && (
              <div>
                <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium mb-1.5">
                  Respondent
                </p>
                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line">
                  {case_.respondentName.replace(/;/g, '\n')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Case details grid */}
      <div className="bg-surface-1 border border-border rounded-xl p-5">
        <h2 className="text-[11px] uppercase tracking-wider font-medium text-text-muted mb-4">
          Case Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow icon={<MapPin />} label="Court" value={case_.courtName} />
          <InfoRow icon={<Hash />} label="Court Number" value={case_.courtNumber} />
          <InfoRow icon={<User />} label="Judge" value={case_.judgeName} />
          <InfoRow icon={<Activity />} label="Stage" value={case_.caseStage} />
          <InfoRow icon={<Calendar />} label="Filing Date" value={formatDate(case_.filingDate)} />
          <InfoRow icon={<Hash />} label="Filing Number" value={case_.filingNumber} />
          <InfoRow icon={<Calendar />} label="Last Hearing" value={formatDate(case_.lastHearingDate)} />
          <InfoRow
            icon={<Clock />}
            label="Last Updated"
            value={formatDateTime(case_.lastPolledAt)}
          />
        </div>
      </div>

      {/* Acts */}
      {case_.acts.length > 0 && (
        <div className="bg-surface-1 border border-border rounded-xl p-5">
          <h2 className="text-[11px] uppercase tracking-wider font-medium text-text-muted mb-4 flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5" />
            Acts &amp; Sections
          </h2>
          <div className="space-y-2">
            {case_.acts.map((act, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-4 px-3 py-2.5 bg-surface-2 rounded-lg"
              >
                <p className="text-sm text-text-primary">{act.actName}</p>
                <p className="text-sm text-text-secondary font-mono shrink-0">
                  Sec. {act.section}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hearing history */}
      <div className="bg-surface-1 border border-border rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-2/50 transition-colors"
          onClick={() => setHistoryExpanded((p) => !p)}
        >
          <h2 className="text-[11px] uppercase tracking-wider font-medium text-text-muted flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" />
            Hearing History ({case_.hearingHistory.length})
          </h2>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-text-muted transition-transform duration-200',
              historyExpanded && 'rotate-180'
            )}
          />
        </button>

        <AnimatePresence initial={false}>
          {historyExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {case_.hearingHistory.length === 0 ? (
                <div className="px-5 pb-5 text-sm text-text-muted text-center py-4">
                  No hearing history recorded yet
                </div>
              ) : (
                <div className="px-5 pb-5">
                  {/* Timeline */}
                  <div className="relative space-y-0">
                    {case_.hearingHistory
                      .sort(
                        (a, b) =>
                          new Date(b.hearingDate).getTime() - new Date(a.hearingDate).getTime()
                      )
                      .map((h, i, arr) => (
                        <div key={i} className="relative flex gap-4 pb-4 last:pb-0">
                          {/* Timeline line */}
                          {i < arr.length - 1 && (
                            <div className="absolute left-[7px] top-4 bottom-0 w-[1px] bg-border" />
                          )}
                          {/* Dot */}
                          <div className="shrink-0 mt-1 h-3.5 w-3.5 rounded-full bg-surface-3 border-2 border-border-strong z-10" />
                          {/* Content */}
                          <div className="min-w-0 pb-1">
                            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                              <p className="text-sm font-medium text-text-primary">
                                {formatDate(h.hearingDate)}
                              </p>
                              {h.purpose && (
                                <p className="text-[12px] text-text-muted">{h.purpose}</p>
                              )}
                            </div>
                            {h.judgeName && h.judgeName !== '—' && (
                              <p className="text-[12px] text-text-muted mt-0.5 flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {truncate(h.judgeName, 60)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
