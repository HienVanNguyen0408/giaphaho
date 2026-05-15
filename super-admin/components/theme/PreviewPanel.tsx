'use client'

import { useState } from 'react'
import type { Theme } from '@/types'

interface PreviewPanelProps {
  theme: Partial<Theme>
}

export function PreviewPanel({ theme }: PreviewPanelProps) {
  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop')

  const styles = {
    '--preview-accent': theme.primaryColor ?? '#8B0000',
    '--preview-accent-2': theme.accentColor ?? '#6B0000',
    '--preview-font': theme.fontFamily ?? 'Be Vietnam Pro',
  } as React.CSSProperties

  return (
    <div className="space-y-3">
      {/* Toggle */}
      <div className="flex gap-1 rounded-lg p-1 w-fit" style={{ background: 'var(--t-surface-2)' }}>
        {(['desktop', 'mobile'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="px-3 py-1 rounded-md text-xs transition-colors"
            style={{
              background: mode === m ? 'var(--t-surface)' : 'transparent',
              color: mode === m ? 'var(--t-text)' : 'var(--t-text-3)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {m === 'desktop' ? 'Desktop' : 'Mobile'}
          </button>
        ))}
      </div>

      {/* Preview frame */}
      <div
        className="rounded-lg overflow-hidden"
        style={{
          border: '1px solid var(--t-border)',
          boxShadow: '0 18px 44px color-mix(in oklch, var(--t-text) 10%, transparent)',
          width: mode === 'mobile' ? '375px' : '100%',
          maxWidth: '100%',
          ...styles,
        }}
      >
        {/* Fake nav */}
        <div className="h-12 flex items-center px-4 gap-3" style={{ background: 'linear-gradient(135deg, var(--preview-accent), var(--preview-accent-2))', fontFamily: 'var(--preview-font)' }}>
          {theme.logo && <img src={theme.logo} alt="logo" className="h-8 w-8 object-contain rounded" />}
          <span className="text-white font-semibold text-sm">Gia Phả Họ Nguyễn</span>
          <div className="ml-auto flex gap-3 text-xs text-white opacity-80">
            <span>Gia phả</span>
            <span>Thành viên</span>
            <span>Tin tức</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3" style={{ fontFamily: 'var(--preview-font)', background: '#fffaf2' }}>
          <h1 className="text-lg font-bold" style={{ color: 'var(--preview-accent)' }}>
            Gia Phả Họ Nguyễn
          </h1>
          <p className="text-sm text-gray-600">
            Nền tảng quản lý gia phả số — lưu giữ và kết nối các thế hệ.
          </p>
          <div
            className="px-4 py-2 rounded-md text-sm font-semibold text-white w-fit"
            style={{ background: 'linear-gradient(135deg, var(--preview-accent), var(--preview-accent-2))' }}
          >
            Xem gia phả
          </div>
        </div>
      </div>

      {theme.customCss && (
        <div
          className="text-xs px-3 py-2 rounded-lg font-mono"
          style={{ background: 'var(--t-surface-2)', color: 'var(--t-text-3)' }}
        >
          {theme.customCss.slice(0, 100)}...
        </div>
      )}
    </div>
  )
}
