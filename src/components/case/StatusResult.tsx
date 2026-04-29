import React from 'react'

import {
  Scale,
  Calendar,
  MapPin,
  User,
  Activity,
  FileText,
  Plus,
  BookOpen,
} from 'lucide-react'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate, truncate } from '@/lib/utils'
import type { CaseResponse } from '@/types'

interface StatusResultProps {
  case_: CaseResponse
  onTrack?: () => void
  alreadyTracking?: boolean
}

export const StatusResult: React.FC<StatusResultProps> = ({
  case_,
  onTrack,
  alreadyTracking,
}) => {
  return (
    <div
      className="bg-surface-1 border border-border rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 border-b border-border flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 h-10 w-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Scale className="h-4 w-4 text-accent" />
          </div>
          <div>
            <p className="font-mono text-[13px] text-accent tracking-wide">{case_.cnrNumber}</p>
            <h3 className="text-base font-semibold text-text-primary font-display mt-0.5">
              {case_.caseType ?? 'Court Case'}
            </h3>
            {case_.filingNumber && (
              <p className="text-[12px] text-text-muted mt-0.5">Filing No. {case_.filingNumber}</p>
            )}
          </div>
        </div>
        <StatusBadge status={case_.status} />
      </div>

      {/* Info grid */}
      <div className="p-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">Court</p>
          <p className="text-sm text-text-primary flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-text-muted shrink-0" />
            {truncate(case_.courtName, 40) || '—'}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">Judge</p>
          <p className="text-sm text-text-primary flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-text-muted shrink-0" />
            {truncate(case_.judgeName, 30) || '—'}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">Next Hearing</p>
          <p className="text-sm text-text-primary flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-text-muted shrink-0" />
            {formatDate(case_.nextHearingDate) || 'Not scheduled'}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">Stage</p>
          <p className="text-sm text-text-primary flex items-center gap-1">
            <Activity className="h-3.5 w-3.5 text-text-muted shrink-0" />
            {case_.caseStage || '—'}
          </p>
        </div>
      </div>

      {/* Parties */}
      {(case_.petitionerName || case_.respondentName) && (
        <div className="px-5 pb-5">
          <div className="bg-surface-2 rounded-lg p-3.5 space-y-2">
            {case_.petitionerName && (
              <div>
                <p className="text-[11px] text-text-muted uppercase tracking-wider mb-0.5">Petitioner</p>
                <p className="text-sm text-text-primary line-clamp-2">{case_.petitionerName}</p>
              </div>
            )}
            {case_.respondentName && (
              <div>
                <p className="text-[11px] text-text-muted uppercase tracking-wider mb-0.5">Respondent</p>
                <p className="text-sm text-text-primary line-clamp-2">{case_.respondentName}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Acts */}
      {case_.acts.length > 0 && (
        <div className="px-5 pb-5">
          <p className="text-[11px] text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <BookOpen className="h-3 w-3" /> Acts &amp; Sections
          </p>
          <div className="flex flex-wrap gap-2">
            {case_.acts.map((a, i) => (
              <span
                key={i}
                className="text-[12px] px-2.5 py-1 bg-surface-3 border border-border rounded-full text-text-secondary"
              >
                {a.actName} {a.section ? `§${a.section}` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent hearings */}
      {case_.hearingHistory.length > 0 && (
        <div className="px-5 pb-5">
          <p className="text-[11px] text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="h-3 w-3" /> Recent Hearings
          </p>
          <div className="space-y-1.5">
            {case_.hearingHistory
              .sort((a, b) => new Date(b.hearingDate).getTime() - new Date(a.hearingDate).getTime())
              .slice(0, 4)
              .map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 bg-surface-2 rounded-lg text-sm"
                >
                  <span className="text-text-secondary">{formatDate(h.hearingDate)}</span>
                  <span className="text-text-muted text-[12px]">{h.purpose || '—'}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Track CTA */}
      {onTrack && (
        <div className="px-5 pb-5">
          <Button
            className="w-full"
            variant={alreadyTracking ? 'subtle' : 'primary'}
            disabled={alreadyTracking}
            icon={<Plus />}
            onClick={onTrack}
          >
            {alreadyTracking ? 'Already tracking' : 'Track this case'}
          </Button>
        </div>
      )}
    </div>
  )
}
