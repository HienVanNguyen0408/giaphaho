import { Card } from '@/components/shared/Card'
import type { Clan } from '@/types'

interface ActivityTabProps {
  clan: Clan
}

const ACTION_LABELS: Record<string, string> = {
  CREATE_CLAN: 'Tạo họ',
  UPDATE_CLAN: 'Cập nhật thông tin',
  GENERATE_LICENSE: 'Tạo license mới',
  REVOKE_LICENSE: 'Thu hồi license',
  RENEW_LICENSE: 'Gia hạn license',
  UPDATE_THEME: 'Cập nhật theme',
  GENERATE_DOWNLOAD: 'Tạo link tải',
  UPDATE_CLAN_STATUS: 'Thay đổi trạng thái',
}

export function ActivityTab({ clan }: ActivityTabProps) {
  const logs = (clan as Clan & { activityLogs?: Array<{ id: string; action: string; createdAt: string; admin?: { name: string } }> }).activityLogs ?? []

  return (
    <Card>
      <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--t-text)' }}>Lịch sử hoạt động</h2>
      {logs.length === 0 ? (
        <p className="text-sm text-center py-4" style={{ color: 'var(--t-text-3)' }}>Chưa có hoạt động nào</p>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-4 items-start">
              <div
                className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                style={{ background: 'var(--t-accent)' }}
              />
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--t-text)' }}>
                  {ACTION_LABELS[log.action] ?? log.action}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--t-text-3)' }}>
                  {log.admin?.name ?? 'System'} · {new Date(log.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
