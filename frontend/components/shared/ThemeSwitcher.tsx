'use client';

import { useState } from 'react';
import { useTheme, THEMES } from '@/components/providers/ThemeProvider';
import type { ThemeId } from '@/components/providers/ThemeProvider';

const themeDescriptions: Record<ThemeId, string> = {
  bachLien: 'Ấm áp & thanh lịch',
  sonMai: 'Sang trọng tối màu',
  giayCo: 'Cổ điển & trầm mặc',
  lamNgoc: 'Hiện đại tối màu',
};

export default function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);

  const current = themes.find((t) => t.id === theme)!;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Expanded panel */}
      {open && (
        <div
          style={{
            background: 'var(--t-surface)',
            border: '1px solid var(--t-border)',
            color: 'var(--t-text)',
            boxShadow: '0 8px 40px -8px rgba(0,0,0,0.35)',
            borderRadius: '1rem',
          }}
          className="w-64 overflow-hidden"
        >
          {/* Panel header */}
          <div
            style={{
              background: 'var(--t-surface-2)',
              borderBottom: '1px solid var(--t-border)',
              fontFamily: 'var(--t-display-font)',
            }}
            className="px-4 py-3"
          >
            <p className="text-xs tracking-widest uppercase" style={{ color: 'var(--t-text-3)' }}>
              Giao diện
            </p>
            <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--t-text)' }}>
              Chọn phong cách
            </p>
          </div>

          {/* Theme options */}
          <div className="p-3 space-y-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setOpen(false);
                }}
                className="w-full text-left rounded-xl overflow-hidden transition-all duration-200"
                style={{
                  border: t.id === theme
                    ? '2px solid var(--t-accent)'
                    : '2px solid transparent',
                  outline: t.id === theme ? 'none' : undefined,
                }}
              >
                <div className="flex items-center gap-3 px-3 py-2.5"
                  style={{
                    background: t.id === theme ? 'color-mix(in oklch, var(--t-accent) 8%, var(--t-surface))' : 'var(--t-surface-2)',
                  }}
                >
                  {/* Color swatches */}
                  <div className="flex gap-1 shrink-0">
                    {t.swatches.map((s, i) => (
                      <div
                        key={i}
                        className="rounded-full"
                        style={{
                          width: i === 0 ? '20px' : '10px',
                          height: '20px',
                          background: s,
                          border: '1px solid rgba(0,0,0,0.15)',
                        }}
                      />
                    ))}
                  </div>

                  {/* Theme info */}
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs font-semibold truncate"
                      style={{
                        color: 'var(--t-text)',
                        fontFamily: 'var(--t-display-font)',
                      }}
                    >
                      {t.name}
                    </p>
                    <p className="text-[10px] truncate" style={{ color: 'var(--t-text-3)' }}>
                      {themeDescriptions[t.id]}
                    </p>
                  </div>

                  {/* Active indicator */}
                  {t.id === theme && (
                    <svg
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="w-4 h-4 shrink-0"
                      style={{ color: 'var(--t-accent)' }}
                    >
                      <circle cx="8" cy="8" r="6" />
                      <path
                        d="M5 8l2 2 4-4"
                        stroke="var(--t-surface)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Footer hint */}
          <p
            className="text-center text-[10px] pb-3"
            style={{ color: 'var(--t-text-3)' }}
          >
            Giao diện được lưu tự động
          </p>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Chọn giao diện"
        aria-expanded={open}
        className="rounded-full flex items-center gap-2 transition-all duration-200 active:scale-95"
        style={{
          background: open ? 'var(--t-accent)' : 'var(--t-surface)',
          border: '1px solid var(--t-border)',
          color: open ? 'var(--t-surface)' : 'var(--t-text)',
          boxShadow: open
            ? '0 4px 20px -4px color-mix(in oklch, var(--t-accent) 60%, transparent)'
            : '0 4px 16px -4px rgba(0,0,0,0.2)',
          padding: '0.625rem 1rem',
        }}
      >
        {/* Swatch dots */}
        <div className="flex gap-1">
          {current.swatches.slice(0, 3).map((s, i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: '8px',
                height: '8px',
                background: open ? 'currentColor' : s,
                opacity: open ? (i === 0 ? 1 : 0.7) : 1,
              }}
            />
          ))}
        </div>
        <span className="text-xs font-medium leading-none" style={{ fontFamily: 'var(--t-display-font)' }}>
          {open ? 'Đóng' : current.name}
        </span>
      </button>
    </div>
  );
}
