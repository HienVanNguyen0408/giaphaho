'use client';

import { useState, FormEvent, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { authApi, ApiError } from '@/lib/api';

const DEMO_EMAIL = 'nvhien@gmail.com';
const DEMO_PASSWORD = 'nvhien@123';

function GeometricBackground() {
  return (
    <>
      {/* Diamond lattice */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.03 }}
      >
        <defs>
          <pattern id="dp" x="0" y="0" width="52" height="52" patternUnits="userSpaceOnUse">
            <polygon points="26,2 50,26 26,50 2,26" fill="none" stroke="var(--t-warning)" strokeWidth="0.8" />
            <polygon points="26,14 38,26 26,38 14,26" fill="none" stroke="var(--t-warning)" strokeWidth="0.4" />
            <circle cx="26" cy="2" r="1.5" fill="var(--t-warning)" />
            <circle cx="50" cy="26" r="1.5" fill="var(--t-warning)" />
            <circle cx="26" cy="50" r="1.5" fill="var(--t-warning)" />
            <circle cx="2" cy="26" r="1.5" fill="var(--t-warning)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dp)" />
      </svg>

      {/* Top-left corner flourish */}
      <svg
        className="absolute top-0 left-0 w-64 h-64 pointer-events-none"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.18 }}
      >
        <path d="M0 200 L0 0 L200 0" stroke="var(--t-warning)" strokeWidth="1.5" />
        <path d="M18 182 L18 18 L182 18" stroke="var(--t-warning)" strokeWidth="0.6" />
        <path d="M36 164 L36 36 L164 36" stroke="var(--t-warning)" strokeWidth="0.25" />
        <circle cx="0" cy="0" r="75" stroke="var(--t-warning)" strokeWidth="0.5" fill="none" />
        <circle cx="0" cy="0" r="100" stroke="var(--t-warning)" strokeWidth="0.25" fill="none" />
        <line x1="0" y1="40" x2="40" y2="0" stroke="var(--t-warning)" strokeWidth="0.5" />
        <line x1="0" y1="80" x2="80" y2="0" stroke="var(--t-warning)" strokeWidth="0.3" />
        <line x1="0" y1="120" x2="120" y2="0" stroke="var(--t-warning)" strokeWidth="0.15" />
      </svg>

      {/* Bottom-right corner flourish */}
      <svg
        className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.18, transform: 'rotate(180deg)' }}
      >
        <path d="M0 200 L0 0 L200 0" stroke="var(--t-warning)" strokeWidth="1.5" />
        <path d="M18 182 L18 18 L182 18" stroke="var(--t-warning)" strokeWidth="0.6" />
        <path d="M36 164 L36 36 L164 36" stroke="var(--t-warning)" strokeWidth="0.25" />
        <circle cx="0" cy="0" r="75" stroke="var(--t-warning)" strokeWidth="0.5" fill="none" />
        <circle cx="0" cy="0" r="100" stroke="var(--t-warning)" strokeWidth="0.25" fill="none" />
        <line x1="0" y1="40" x2="40" y2="0" stroke="var(--t-warning)" strokeWidth="0.5" />
        <line x1="0" y1="80" x2="80" y2="0" stroke="var(--t-warning)" strokeWidth="0.3" />
      </svg>

      {/* Angled wash */}
      <div
        className="absolute left-1/2 top-1/2 h-[620px] w-[920px] -translate-x-1/2 -translate-y-1/2 rotate-[-8deg] pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, color-mix(in oklch, var(--t-accent) 12%, transparent), color-mix(in oklch, var(--t-gold) 10%, transparent), transparent 72%)',
        }}
      />
    </>
  );
}

function LoginContent() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setYear(new Date().getFullYear().toString());
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authApi.login(email, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  function fillDemo() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError(null);
  }

  const inputStyle = {
    background: 'color-mix(in oklch, var(--t-surface-2) 88%, var(--t-surface))',
    border: '1px solid var(--t-border)',
    color: 'var(--t-text)',
    caretColor: 'var(--t-accent)',
  } as React.CSSProperties;

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 py-16 overflow-hidden"
      style={{ background: 'var(--t-bg)' }}
    >
      <GeometricBackground />

      <div
        className="relative z-10 w-full max-w-[400px]"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.55s ease, transform 0.55s ease',
        }}
      >
        {/* ── Brand ── */}
        <div className="text-center mb-9">
          <div className="relative inline-block mb-5">
            <svg
              className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)]"
              viewBox="0 0 88 88"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ opacity: 0.22 }}
            >
              <polygon points="44,3 81,23 81,65 44,85 7,65 7,23" stroke="var(--t-warning)" strokeWidth="1" />
              <polygon points="44,13 71,29 71,59 44,75 17,59 17,29" stroke="var(--t-warning)" strokeWidth="0.5" strokeDasharray="3 4" />
            </svg>
            <div
              className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl"
              style={{
                background: 'var(--t-accent)',
                boxShadow: '0 8px 40px color-mix(in oklch, var(--t-accent) 20%, transparent)',
              }}
            >
              <ShieldCheck size={28} color="#fff" />
            </div>
          </div>

          <h1
            className="text-[1.65rem] mb-2 tracking-wide"
            style={{
              fontFamily: "'Be Vietnam Pro', sans-serif",
              fontWeight: 700,
              color: 'var(--t-text)',
              letterSpacing: '0.03em',
            }}
          >
            Super Admin
          </h1>

          <div className="flex items-center justify-center gap-3">
            <div
              className="h-px flex-1 max-w-[60px]"
              style={{ background: 'linear-gradient(to right, transparent, color-mix(in oklch, var(--t-warning) 45%, transparent))' }}
            />
            <span
              className="text-[10px] font-semibold uppercase"
              style={{ color: 'color-mix(in oklch, var(--t-warning) 65%, transparent)', letterSpacing: '0.22em' }}
            >
              Cổng quản trị nền tảng
            </span>
            <div
              className="h-px flex-1 max-w-[60px]"
              style={{ background: 'linear-gradient(to left, transparent, color-mix(in oklch, var(--t-warning) 45%, transparent))' }}
            />
          </div>
        </div>

        {/* ── Card ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'color-mix(in oklch, var(--t-surface) 94%, var(--t-accent))',
            backdropFilter: 'blur(16px)',
            border: '1px solid color-mix(in oklch, var(--t-accent) 20%, var(--t-border))',
            boxShadow: '0 0 0 1px color-mix(in oklch, var(--t-warning) 7%, transparent), 0 28px 70px color-mix(in oklch, var(--t-text) 12%, transparent)',
          }}
        >
          {/* top accent line */}
          <div
            style={{
              height: '2px',
              background: 'linear-gradient(90deg, transparent, color-mix(in oklch, var(--t-warning) 65%, transparent) 30%, color-mix(in oklch, var(--t-accent) 40%, transparent) 70%, transparent)',
            }}
          />

          <div className="p-7 pb-6">
            <p
              className="text-[10px] font-semibold uppercase mb-6"
              style={{ color: 'var(--t-text-3)', letterSpacing: '0.2em' }}
            >
              Đăng nhập
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-[10px] font-semibold uppercase mb-1.5"
                  style={{ color: 'var(--t-text-3)', letterSpacing: '0.15em' }}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="admin@giaphaho.vn"
                  className="w-full text-sm rounded-xl py-3 px-4 outline-none transition-all"
                  style={inputStyle}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'color-mix(in oklch, var(--t-warning) 55%, transparent)';
                    e.target.style.boxShadow = '0 0 0 3px color-mix(in oklch, var(--t-warning) 8%, transparent)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'color-mix(in oklch, var(--t-warning) 30%, transparent)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-[10px] font-semibold uppercase mb-1.5"
                  style={{ color: 'var(--t-text-3)', letterSpacing: '0.15em' }}
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full text-sm rounded-xl py-3 pl-4 pr-11 outline-none transition-all"
                    style={inputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'color-mix(in oklch, var(--t-warning) 55%, transparent)';
                      e.target.style.boxShadow = '0 0 0 3px color-mix(in oklch, var(--t-warning) 8%, transparent)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'color-mix(in oklch, var(--t-warning) 30%, transparent)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'color-mix(in oklch, var(--t-warning) 65%, transparent)' }}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  className="rounded-xl px-4 py-3 text-xs flex items-start gap-2.5"
                  style={{
                    background: 'color-mix(in oklch, var(--t-error) 15%, transparent)',
                    border: '1px solid color-mix(in oklch, var(--t-error) 30%, transparent)',
                    color: 'var(--t-error)',
                  }}
                >
                  <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                style={{
                  background: loading ? 'color-mix(in oklch, var(--t-accent) 80%, var(--t-surface))' : 'var(--t-accent)',
                  color: '#ffffff',
                  boxShadow: '0 4px 24px color-mix(in oklch, var(--t-accent) 16%, transparent)',
                  letterSpacing: '0.05em',
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <span
                        className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
                        style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#ffffff' }}
                      />
                      Đang đăng nhập...
                    </>
                  ) : (
                    'Đăng nhập'
                  )}
                </span>
                {!loading && (
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'var(--t-accent-hover)' }}
                  />
                )}
              </button>
            </form>
          </div>

          {/* ── Demo account ── */}
          <div className="px-7 pb-7">
            <div
              className="h-px mb-4"
              style={{ background: 'linear-gradient(90deg, transparent, color-mix(in oklch, var(--t-warning) 30%, transparent), transparent)' }}
            />
            <button
              type="button"
              onClick={fillDemo}
              className="w-full rounded-xl p-3 text-left transition-colors group"
              style={{
                background: 'color-mix(in oklch, var(--t-surface-2) 70%, var(--t-surface))',
                border: '1px solid color-mix(in oklch, var(--t-accent) 14%, var(--t-border))',
                cursor: 'pointer',
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--t-accent)' }} />
                  <span className="text-[11px] font-semibold" style={{ color: 'var(--t-text-2)' }}>
                    Tài khoản demo
                  </span>
                </div>
                <span
                  className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--t-accent)' }}
                >
                  Nhấn để điền →
                </span>
              </div>
              <p className="text-[10px] font-mono leading-relaxed" style={{ color: 'var(--t-text-3)' }}>
                {DEMO_EMAIL}
              </p>
              <p className="text-[10px] font-mono" style={{ color: 'var(--t-text-3)' }}>
                {DEMO_PASSWORD}
              </p>
            </button>
          </div>
        </div>

        <p className="text-center mt-5 text-[11px]" style={{ color: 'color-mix(in oklch, var(--t-warning) 50%, transparent)' }}>
          Gia Phả Hồ © {year}
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: 'var(--t-bg)' }} />}>
      <LoginContent />
    </Suspense>
  );
}
