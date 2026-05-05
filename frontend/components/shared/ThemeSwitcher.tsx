'use client';

import { useState } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { ThemeId } from '@/components/providers/ThemeProvider';

const THEMES_META: {
  id: ThemeId;
  name: string;
  desc: string;
  bg: string;
  fg: string;
  dot1: string;
  dot2: string;
}[] = [
  { id: 'bachLien', name: 'Bạch Liên', desc: 'Ấm áp & sáng', bg: '#faf7f0', fg: '#1c1208', dot1: '#8b1a1a', dot2: '#ca8a04' },
  { id: 'sonMai',   name: 'Sơn Mài',   desc: 'Vàng & đen',   bg: '#0c0804', fg: '#f0deb8', dot1: '#d4a03c', dot2: '#d4af37' },
  { id: 'giayCo',  name: 'Giấy Cổ',   desc: 'Cổ điển nâu',  bg: '#f2e8d0', fg: '#2a1a06', dot1: '#7c2d12', dot2: '#b07820' },
  { id: 'lamNgoc', name: 'Lam Ngọc',  desc: 'Tối & ngọc bích', bg: '#080c18', fg: '#e4ecf5', dot1: '#14b8a6', dot2: '#d4af37' },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const current = THEMES_META.find((t) => t.id === theme) ?? THEMES_META[0];

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-2">

      {/* Panel */}
      {open && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: '#1c1917',
            border: '1px solid #3d3530',
            boxShadow: '0 12px 40px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
            width: '220px',
          }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: '#3d3530' }}>
            <p className="text-xs tracking-widest uppercase" style={{ color: '#78716c' }}>Giao diện</p>
          </div>

          <div className="p-2 space-y-1">
            {THEMES_META.map((t) => {
              const active = t.id === theme;
              return (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t.id); setOpen(false); }}
                  className="w-full text-left rounded-xl flex items-center gap-3 px-3 py-2.5 transition-all duration-150"
                  style={{
                    background: active ? '#292524' : 'transparent',
                    outline: active ? `2px solid ${t.dot1}` : '2px solid transparent',
                    outlineOffset: '-2px',
                  }}
                >
                  {/* Mini preview swatch */}
                  <div className="rounded-lg overflow-hidden shrink-0 flex" style={{ width: 32, height: 32, background: t.bg, border: `1px solid rgba(255,255,255,0.1)` }}>
                    <div style={{ width: '50%', background: t.dot1 }} />
                    <div style={{ width: '50%', background: t.dot2 }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight" style={{ color: '#e7e5e4' }}>
                      {t.name}
                    </p>
                    <p className="text-[10px] leading-tight mt-0.5" style={{ color: '#78716c' }}>
                      {t.desc}
                    </p>
                  </div>

                  {active && (
                    <svg viewBox="0 0 12 12" className="shrink-0" width={12} height={12} fill={t.dot1}>
                      <circle cx="6" cy="6" r="6" />
                      <path d="M3.5 6l1.8 1.8 3.2-3.6" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          <div className="px-4 py-2.5 border-t text-center" style={{ borderColor: '#3d3530' }}>
            <p className="text-[10px]" style={{ color: '#57534e' }}>Tự động lưu vào trình duyệt</p>
          </div>
        </div>
      )}

      {/* Toggle button — always dark/gold so visible on any background */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Đổi giao diện"
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-full transition-all duration-200 active:scale-95 select-none"
        style={{
          background: open ? current.dot1 : '#1c1917',
          border: `1px solid ${open ? current.dot1 : '#44403c'}`,
          color: open ? '#fff' : '#d6d3d1',
          padding: '8px 14px',
          boxShadow: '0 4px 16px -4px rgba(0,0,0,0.5)',
        }}
      >
        {/* Color dots */}
        <span className="flex gap-1 items-center">
          <span className="rounded-full block" style={{ width: 8, height: 8, background: current.dot1 }} />
          <span className="rounded-full block" style={{ width: 8, height: 8, background: current.dot2 }} />
        </span>
        <span className="text-xs font-medium leading-none">
          {open ? 'Đóng' : current.name}
        </span>
      </button>
    </div>
  );
}
