'use client'

import { Card } from '@/components/shared/Card'
import { AccountSection } from '@/components/settings/AccountSection'
import { PlatformSection } from '@/components/settings/PlatformSection'

export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-4">
      <div className="page-panel rounded-lg overflow-hidden p-5">
        <h1
          className="relative z-10 text-2xl font-bold"
          style={{ color: 'var(--t-text)' }}
        >
          Cài đặt
        </h1>
        <p className="relative z-10 text-sm mt-0.5" style={{ color: 'var(--t-text-3)' }}>
          Quản lý tài khoản và nền tảng
        </p>
      </div>

      <AccountSection />
      <PlatformSection />

      {process.env.NODE_ENV === 'development' && (
        <Card>
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: 'color-mix(in oklch, var(--t-error) 10%, transparent)',
                color: 'var(--t-error)',
              }}
            >
              <span className="text-[13px] font-bold">!</span>
            </div>
            <div className="flex-1">
              <h2
                className="text-[13px] font-semibold mb-0.5"
                style={{ color: 'var(--t-error)' }}
              >
                Danger Zone
              </h2>
              <p className="text-[12px] mb-3" style={{ color: 'var(--t-text-3)' }}>
                Chỉ dùng trong môi trường development.
              </p>
              <button
                className="px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-opacity hover:opacity-80"
                style={{
                  background: 'color-mix(in oklch, var(--t-error) 10%, transparent)',
                  color: 'var(--t-error)',
                  border: '1px solid color-mix(in oklch, var(--t-error) 25%, transparent)',
                  cursor: 'pointer',
                }}
                onClick={() => alert('Reset seed data — chức năng chưa được triển khai')}
              >
                Reset seed data
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
