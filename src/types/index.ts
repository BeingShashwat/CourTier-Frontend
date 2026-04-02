// ─── Auth ────────────────────────────────────────────────────────────────────

export interface RegisterRequest {
  fullName: string
  email: string
  password: string
  phone?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  email: string
  fullName: string
}

export interface VerifyOtpRequest {
  email: string
  otp: string
}
 
export interface ResetPasswordRequest {
  email: string
  otp: string
  newPassword: string   // min 8 chars — enforced by backend
}
// ─── Case ────────────────────────────────────────────────────────────────────

export type CaseStatus = 'PENDING' | 'DISPOSED' | 'TRANSFERRED' | 'UNKNOWN'

export interface HearingHistoryItem {
  hearingDate: string   // ISO date string "YYYY-MM-DD"
  purpose: string
  judgeName: string
}

export interface CaseActItem {
  actName: string
  section: string
}

export interface CaseResponse {
  id: number
  cnrNumber: string
  caseType: string | null
  filingNumber: string | null
  filingDate: string | null
  courtName: string | null
  courtNumber: string | null
  judgeName: string | null
  petitionerName: string | null
  respondentName: string | null
  status: CaseStatus
  nextHearingDate: string | null
  lastHearingDate: string | null
  caseStage: string | null
  lastPolledAt: string | null
  hearingHistory: HearingHistoryItem[]
  acts: CaseActItem[]
  trackerCount: number
}

export interface AddCaseRequest {
  cnrNumber: string
  sessionId?: string
  captchaSolution?: string
}

// ─── Captcha ─────────────────────────────────────────────────────────────────

export interface CaptchaResponse {
  sessionId: string
  captchaImageBase64: string
}

// ─── API Wrapper ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: string | null
}

// ─── UI State ────────────────────────────────────────────────────────────────

export type ViewMode = 'grid' | 'list'
export type FilterStatus = 'ALL' | CaseStatus

export interface ToastItem {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
}


// ─── Notifications (new section) ─────────────────────────────────────────────
 
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED'
 
export interface CourtNotification {
  id: number
  userId: number
  cnrNumber: string
  changeType: string        // e.g. "HEARING_DATE_CHANGED", "STATUS_CHANGED"
  message: string
  status: NotificationStatus
  createdAt: string         // ISO datetime "YYYY-MM-DDTHH:mm:ss"
}
