import { Badge } from '../shared/Badge'
import type { ClanStatus, LicenseType } from '@/types'

export function StatusBadge({ status }: { status: ClanStatus }) {
  const map: Record<ClanStatus, { variant: 'success' | 'warning' | 'error'; label: string }> = {
    ACTIVE: { variant: 'success', label: 'Hoạt động' },
    SUSPENDED: { variant: 'warning', label: 'Tạm dừng' },
    EXPIRED: { variant: 'error', label: 'Hết hạn' },
  }
  const { variant, label } = map[status] ?? { variant: 'neutral', label: status }
  return <Badge variant={variant}>{label}</Badge>
}

export function LicenseBadge({ type }: { type: LicenseType }) {
  const map: Record<LicenseType, { variant: 'info' | 'neutral'; label: string }> = {
    PERMANENT: { variant: 'neutral', label: 'Vĩnh viễn' },
    SUBSCRIPTION: { variant: 'info', label: 'Thuê bao' },
  }
  const { variant, label } = map[type] ?? { variant: 'neutral', label: type }
  return <Badge variant={variant}>{label}</Badge>
}
