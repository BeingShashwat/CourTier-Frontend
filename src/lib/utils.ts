import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'

// ─── Classname merge ──────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Date formatting ──────────────────────────────────────────────────────

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const parsed = parseISO(dateStr)
    if (!isValid(parsed)) return '—'
    return format(parsed, 'd MMM yyyy')
  } catch {
    return '—'
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const parsed = parseISO(dateStr)
    if (!isValid(parsed)) return '—'
    return format(parsed, 'd MMM yyyy, h:mm a')
  } catch {
    return '—'
  }
}

export function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const parsed = parseISO(dateStr)
    if (!isValid(parsed)) return '—'
    return formatDistanceToNow(parsed, { addSuffix: true })
  } catch {
    return '—'
  }
}

export function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null
  try {
    const parsed = parseISO(dateStr)
    if (!isValid(parsed)) return null
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const diff = Math.ceil((parsed.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  } catch {
    return null
  }
}

// ─── CNR helpers ──────────────────────────────────────────────────────────

export function isHighCourtCNR(cnr: string): boolean {
  return cnr.length >= 4 && cnr.substring(0, 4).toUpperCase().endsWith('HC')
}

export function needsCaptcha(cnr: string): boolean {
  return !isHighCourtCNR(cnr)
}

// ─── String helpers ───────────────────────────────────────────────────────

export function truncate(str: string | null | undefined, maxLength: number): string {
  if (!str) return '—'
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '…'
}

export function initials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

// ─── Status helpers ───────────────────────────────────────────────────────

export function statusLabel(status: string | null | undefined): string {
  switch (status) {
    case 'PENDING': return 'Pending'
    case 'DISPOSED': return 'Disposed'
    case 'TRANSFERRED': return 'Transferred'
    case 'UNKNOWN': return 'Unknown'
    default: return status ?? '—'
  }
}

export function statusClass(status: string | null | undefined): string {
  switch (status) {
    case 'PENDING': return 'status-pending'
    case 'DISPOSED': return 'status-disposed'
    case 'TRANSFERRED': return 'status-transferred'
    default: return 'status-unknown'
  }
}

// ─── Auth response normalization ────────────────────────────────────────────

export function normalizeAuthResponse(raw: unknown): import('@/types').AuthResponse | null {
  if (!raw || typeof raw !== 'object') return null

  const data = raw as Record<string, unknown>
  const accessToken =
    (data.accessToken ?? data.AccessToken ?? data.token ?? data.Token) as string | undefined

  if (!accessToken || accessToken === 'undefined' || accessToken === 'null') return null

  return {
    accessToken,
    refreshToken: String(data.refreshToken ?? data.RefreshToken ?? ''),
    email: String(data.email ?? data.Email ?? ''),
    fullName: String(data.fullName ?? data.FullName ?? data.name ?? data.Name ?? ''),
  }
}

// ─── Error extraction ─────────────────────────────────────────────────────

export function extractError(error: unknown): string {
  if (!error) return 'An unexpected error occurred'
  if (typeof error === 'string') return error
  const e = error as Record<string, unknown>
  const responseData = e?.response as Record<string, unknown> | undefined
  const data = responseData?.data as Record<string, unknown> | undefined
  if (data?.error && typeof data.error === 'string') return data.error
  if (e?.message && typeof e.message === 'string') return e.message
  return 'An unexpected error occurred'
}
