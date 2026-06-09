import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/types'

// Add custom property for retries to the Axios request configuration type
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean
  retryCount?: number
}

function normalizeApiBaseUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, '')
  if (!trimmed) return '/api'
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`
}

function buildApiUrl(path: string): string {
  const root = normalizeApiBaseUrl(import.meta.env.VITE_API_URL || '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${root}${normalizedPath}`
}

const apiBaseUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_URL || '')

function applyAuthTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
  api.defaults.headers.common.Authorization = `Bearer ${accessToken}`
}

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Helper to clean up auth credentials and redirect
const logoutAndRedirect = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')

  // Only redirect if not already on the login/register/forgot-password/verify-email pages
  const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/']
  if (!publicPaths.includes(window.location.pathname)) {
    window.location.replace('/login')
  }
}

// ─── Request Interceptor — attach JWT ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Variables to handle refreshing queue
let isRefreshing = false
type QueueItem = {
  resolve: (token: string | null) => void
  reject: (error: unknown) => void
}

let failedQueue: QueueItem[] = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// ─── Response Interceptor — Retries & Token Refresh ───────────────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig
    if (!originalRequest) return Promise.reject(error)

    // 1. Retry Logic for Network Errors and 5xx Server Errors (502, 503, 504)
    const isNetworkError = !error.response
    const isServerError = error.response && error.response.status >= 502 && error.response.status <= 504
    const maxRetries = 3

    if ((isNetworkError || isServerError) && (originalRequest.retryCount ?? 0) < maxRetries) {
      originalRequest.retryCount = (originalRequest.retryCount ?? 0) + 1
      const backoffDelay = Math.pow(2, originalRequest.retryCount) * 1000 // 2s, 4s, 8s
      
      // Wait for backoff delay
      await new Promise((resolve) => setTimeout(resolve, backoffDelay))
      
      // Retry request
      return api(originalRequest)
    }

    // 2. Token Refresh Logic for 401 Errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If we are already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers = originalRequest.headers || {}
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        logoutAndRedirect()
        return Promise.reject(error)
      }

      return new Promise((resolve, reject) => {
        const refreshUrl = buildApiUrl('/auth/refresh')
        const refreshTokenUrl = buildApiUrl('/auth/refresh-token')

        // Attempt to refresh the access token
        axios
          .post(refreshUrl, { refreshToken })
          .then(({ data }) => {
            if (data.success && data.data?.accessToken) {
              const newAccessToken = data.data.accessToken
              const newRefreshToken = data.data.refreshToken || refreshToken

              applyAuthTokens(newAccessToken, newRefreshToken)

              originalRequest.headers = originalRequest.headers || {}
              originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`

              processQueue(null, newAccessToken)
              resolve(api(originalRequest))
            } else {
              logoutAndRedirect()
              reject(new Error('Token refresh failed: Invalid response'))
            }
          })
          .catch((refreshError) => {
            // If refresh fails, try alternative /auth/refresh-token or logout
            axios
              .post(refreshTokenUrl, { refreshToken })
              .then(({ data }) => {
                if (data.success && data.data?.accessToken) {
                  const newAccessToken = data.data.accessToken
                  const newRefreshToken = data.data.refreshToken || refreshToken

                  applyAuthTokens(newAccessToken, newRefreshToken)

                  originalRequest.headers = originalRequest.headers || {}
                  originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`

                  processQueue(null, newAccessToken)
                  resolve(api(originalRequest))
                } else {
                  logoutAndRedirect()
                  reject(refreshError)
                }
              })
              .catch((err) => {
                logoutAndRedirect()
                processQueue(err, null)
                reject(err)
              })
          })
          .finally(() => {
            isRefreshing = false
          })
      })
    }

    return Promise.reject(error)
  }
)

// ─── API Endpoints definition ──────────────────────────────────────────────────
export const authApi = {
  register: (data: import('@/types').RegisterRequest) =>
    api.post<ApiResponse<string>>('/auth/register', data),

  verifyEmail: (data: import('@/types').VerifyOtpRequest) =>
    api.post<ApiResponse<import('@/types').AuthResponse>>('/auth/verify-email', data),

  login: (data: import('@/types').LoginRequest) =>
    api.post<ApiResponse<import('@/types').AuthResponse>>('/auth/login', data),

  // email is a @RequestParam on the backend — goes in query string, not body
  forgotPassword: (email: string) =>
    api.post<ApiResponse<string>>('/auth/forgot-password', null, {
      params: { email },
    }),

  resetPassword: (data: import('@/types').ResetPasswordRequest) =>
    api.post<ApiResponse<string>>('/auth/reset-password', data),
}

export const casesApi = {
  getCaptcha: (cnrNumber: string) =>
    api.get<ApiResponse<import('@/types').CaptchaResponse>>('/cases/captcha', {
      params: { cnrNumber },
    }),

  addCase: (data: import('@/types').AddCaseRequest) =>
    api.post<ApiResponse<import('@/types').CaseResponse>>('/cases', data),

  getMyCases: () =>
    api.get<ApiResponse<import('@/types').CaseResponse[]>>('/cases'),

  getCase: (cnrNumber: string) =>
    api.get<ApiResponse<import('@/types').CaseResponse>>(`/cases/${cnrNumber}`),

  removeCase: (cnrNumber: string) =>
    api.delete<ApiResponse<null>>(`/cases/${cnrNumber}`),

  pollCase: (cnrNumber: string) =>
    api.post<ApiResponse<import('@/types').CaseResponse>>(`/cases/${cnrNumber}/poll`),
}

export const notificationsApi = {
  getMyNotifications: () =>
    api.get<ApiResponse<import('@/types').CourtNotification[]>>('/notifications'),
}

export default api
