import React from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Calendar,
  Scale,
  Users,
  MapPin,
  RefreshCw,
  Trash2,
  ChevronRight,
  Clock,
} from 'lucide-react'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn, formatDate, daysUntil, truncate, timeAgo } from '@/lib/utils'
import type { CaseResponse } from '@/types'

interface CaseCardProps {
  case_: CaseResponse
  onRemove?: (cnr: string) => void
  onRefresh?: (cnr: string) => void
  refreshing?: boolean
  index?: number
}

export const CaseCard: React.FC<CaseCardProps> = ({
  case_,
  onRemove,
  onRefresh,
  refreshing,
}) => {
  const navigate = useNavigate()
  const days = daysUntil(case_.nextHearingDate)

  const hearingUrgency =
    days !== null
      ? days <= 3
        ? 'urgent'
        : days <= 14
        ? 'soon'
        : 'normal'
      : 'none'

  return (
    <div
      className={cn(
        'group relative bg-surface-1 border rounded-xl overflow-hidden',
        'hover:border-border-strong hover:shadow-card-hover transition-all duration-200 cursor-pointer',
        hearingUrgency === 'urgent' ? 'border-warning/30' : 'border-border'
      )}
      onClick={() => navigate(`/cases/${case_.cnrNumber}`)}
    >
      {/* Urgency indicator bar */}
      {hearingUrgency !== 'none' && (
        <div
          className={cn(
            'absolute top-0 left-0 right-0 h-0.5',
            hearingUrgency === 'urgent' ? 'bg-warning' : hearingUrgency === 'soon' ? 'bg-accent' : ''
          )}
        />
      )}

      <div className="p-4 sm:p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="shrink-0 h-9 w-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Scale className="h-4 w-4 text-accent" />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[13px] text-accent font-medium tracking-wide">
                {case_.cnrNumber}
              </p>
              <p className="text-sm text-text-secondary mt-0.5 line-clamp-1">
                {case_.caseType ?? 'Case Type Unknown'}
              </p>
            </div>
          </div>
          <StatusBadge status={case_.status} size="sm" />
        </div>

        {/* Parties */}
        {(case_.petitionerName || case_.respondentName) && (
          <p className="text-[13px] text-text-secondary mb-3 line-clamp-2 leading-relaxed">
            <span className="text-text-primary">
              {truncate(case_.petitionerName, 40)}
            </span>
            {case_.respondentName && (
              <span> vs {truncate(case_.respondentName, 40)}</span>
            )}
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-text-muted">
          {case_.courtName && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {truncate(case_.courtName, 30)}
            </span>
          )}

          {case_.nextHearingDate ? (
            <span
              className={cn(
                'flex items-center gap-1',
                hearingUrgency === 'urgent' && 'text-warning',
                hearingUrgency === 'soon' && 'text-accent'
              )}
            >
              <Calendar className="h-3 w-3" />
              {hearingUrgency === 'urgent'
                ? `In ${days} day${days === 1 ? '' : 's'}`
                : hearingUrgency === 'soon'
                ? `In ${days} days`
                : formatDate(case_.nextHearingDate)}
            </span>
          ) : (
            <span className="flex items-center gap-1 opacity-50">
              <Calendar className="h-3 w-3" />
              No hearing scheduled
            </span>
          )}

          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {case_.trackerCount}/5
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <span className="flex items-center gap-1 text-[11px] text-text-muted">
            <Clock className="h-3 w-3" />
            {case_.lastPolledAt ? timeAgo(case_.lastPolledAt) : 'Not yet synced'}
          </span>

          {/* Actions */}
          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {onRefresh && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRefresh(case_.cnrNumber)}
                loading={refreshing}
                title="Refresh case data"
                aria-label={`Refresh case ${case_.cnrNumber}`}
              >
                <RefreshCw />
              </Button>
            )}
            {onRemove && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(case_.cnrNumber)}
                className="hover:text-danger hover:bg-danger/5"
                title="Stop tracking"
                aria-label={`Stop tracking case ${case_.cnrNumber}`}
              >
                <Trash2 />
              </Button>
            )}
            <ChevronRight className="h-4 w-4 text-text-muted group-hover:text-text-secondary group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>
    </div>
  )
}

// TODO: add manual scrap sync button
