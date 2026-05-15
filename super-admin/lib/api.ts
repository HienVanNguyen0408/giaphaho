const PLATFORM_API_URL = process.env.NEXT_PUBLIC_PLATFORM_API_URL ?? 'http://localhost:8090'

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${PLATFORM_API_URL}${path}`

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const json = (await response.json()) as ApiResponse<T>

  if (!response.ok || !json.success) {
    const error = json.error
    throw new ApiError(
      error?.code ?? 'UNKNOWN_ERROR',
      error?.message ?? 'An unexpected error occurred',
      response.status
    )
  }

  return json.data as T
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ admin: Admin }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () => apiFetch<void>('/api/auth/logout', { method: 'POST' }),
  me: () => apiFetch<{ admin: Admin }>('/api/auth/me'),
}

// Clans
export const clanApi = {
  list: (params?: { status?: string; licenseType?: string; search?: string; page?: number }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString()
    return apiFetch<{ clans: Clan[]; total: number; page: number; totalPages: number }>(
      `/api/clans${query ? `?${query}` : ''}`
    )
  },
  create: (data: CreateClanInput) =>
    apiFetch<{ clan: Clan; licenseKey: string }>('/api/clans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getById: (id: string) => apiFetch<{ clan: Clan }>(`/api/clans/${id}`),
  update: (id: string, data: Partial<CreateClanInput>) =>
    apiFetch<{ clan: Clan }>(`/api/clans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  updateStatus: (id: string, status: string) =>
    apiFetch<{ clan: Clan }>(`/api/clans/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  delete: (id: string) =>
    apiFetch<void>(`/api/clans/${id}`, { method: 'DELETE' }),
}

// License
export const licenseApi = {
  generate: (clanId: string) =>
    apiFetch<{ license: License }>(`/api/clans/${clanId}/license/generate`, { method: 'POST' }),
  revoke: (clanId: string, licenseId: string) =>
    apiFetch<void>(`/api/clans/${clanId}/license/${licenseId}/revoke`, { method: 'PATCH' }),
  renew: (clanId: string, licenseId: string, months: number) =>
    apiFetch<{ license: License }>(`/api/clans/${clanId}/license/${licenseId}/renew`, {
      method: 'POST',
      body: JSON.stringify({ months }),
    }),
  history: (clanId: string) =>
    apiFetch<{ licenses: License[] }>(`/api/clans/${clanId}/license/history`),
}

// Theme
export const themeApi = {
  get: (clanId: string) => apiFetch<{ theme: Theme }>(`/api/clans/${clanId}/theme`),
  update: (clanId: string, data: Partial<Theme>) =>
    apiFetch<{ theme: Theme }>(`/api/clans/${clanId}/theme`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getPublic: (clanCode: string) => apiFetch<{ theme: Theme }>(`/api/theme/${clanCode}`),
}

// Notifications
export const notificationApi = {
  list: () => apiFetch<{ notifications: Notification[] }>('/api/notifications'),
  markRead: (id: string) =>
    apiFetch<void>(`/api/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () =>
    apiFetch<void>('/api/notifications/read-all', { method: 'PATCH' }),
}

// Analytics
export const analyticsApi = {
  overview: () => apiFetch<AnalyticsOverview>('/api/analytics/overview'),
  clans: () => apiFetch<{ data: MonthlyData[] }>('/api/analytics/clans'),
  licenses: () => apiFetch<{ permanent: number; subscription: number }>('/api/analytics/licenses'),
  expiry: () => apiFetch<{ clans: Clan[] }>('/api/analytics/expiry'),
}

// Type imports (from types/index.ts)
import type { Admin, Clan, License, Theme, Notification, AnalyticsOverview, MonthlyData, CreateClanInput } from '../types'
