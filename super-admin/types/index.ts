export interface Admin {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
  updatedAt: string
}

export type LicenseType = 'PERMANENT' | 'SUBSCRIPTION'
export type ClanStatus = 'ACTIVE' | 'SUSPENDED' | 'EXPIRED'

export interface Clan {
  id: string
  name: string
  code: string
  licenseType: LicenseType
  status: ClanStatus
  subdomain?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  notes?: string
  licenses?: License[]
  theme?: Theme
  createdAt: string
  updatedAt: string
}

export interface License {
  id: string
  clanId: string
  type: LicenseType
  key: string
  activatedAt?: string
  expiresAt?: string
  isRevoked: boolean
  downloadCount: number
  maxDownloads: number
  createdAt: string
  updatedAt: string
}

export interface Theme {
  id: string
  clanId: string
  primaryColor: string
  accentColor: string
  logo?: string
  favicon?: string
  fontFamily: string
  customCss?: string
  updatedAt: string
}

export type NotificationType =
  | 'LICENSE_EXPIRY_WARNING'
  | 'LICENSE_EXPIRED'
  | 'CLAN_SUSPENDED'

export interface Notification {
  id: string
  clanId?: string
  type: NotificationType
  message: string
  isRead: boolean
  sentEmail: boolean
  createdAt: string
}

export interface ActivityLog {
  id: string
  clanId?: string
  adminId?: string
  action: string
  detail?: Record<string, unknown>
  createdAt: string
  clan?: Pick<Clan, 'id' | 'name' | 'code'>
  admin?: Pick<Admin, 'id' | 'name' | 'email'>
}

export interface AnalyticsOverview {
  totalClans: number
  activeClans: number
  suspendedClans: number
  expiredClans: number
  permanentClans: number
  subscriptionClans: number
  expiringIn30Days: number
}

export interface MonthlyData {
  month: string
  count: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}

export interface CreateClanInput {
  name: string
  code: string
  licenseType: LicenseType
  subdomain?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  notes?: string
  expiresAt?: string
}
