'use client';

import { useState, FormEvent, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';

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

      {/* Warm center glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklch, var(--t-accent) 10%, transparent) 0%, color-mix(in oklch, var(--t-warning) 6%, transparent) 35%, transparent 65%)',
        }}
      />
    </>
  );
}

function EyeOnIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  );
}

function LoginContent() {
  const router = useRouter();
  const [username, setUsername] = useState('');
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
      await login(username, password);
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    background: 'var(--t-surface-2)',
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
                background: 'linear-gradient(145deg, var(--t-accent), var(--t-warning))',
                boxShadow: '0 8px 40px color-mix(in oklch, var(--t-accent) 45%, transparent)',
              }}
            >
              <span
                className="text-[1.8rem] text-amber-100"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, lineHeight: 1 }}
              >
                P
              </span>
            </div>
          </div>

          <h1
            className="text-[1.65rem] mb-2 tracking-wide"
            style={{
              fontFamily: 'var(--t-display-font)',
              fontWeight: 'var(--t-heading-weight)',
              color: 'var(--t-text)',
              letterSpacing: '0.03em',
            }}
          >
            Họ Phùng Bát Tràng
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
              Cổng quản trị
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
            background: 'rgba(18,12,7,0.88)',
            backdropFilter: 'blur(16px)',
            border: '1px solid color-mix(in oklch, var(--t-warning) 35%, transparent)',
            boxShadow: '0 0 0 1px color-mix(in oklch, var(--t-gold) 7%, transparent), 0 28px 70px rgba(0,0,0,0.65)',
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
              style={{ color: 'rgba(168,162,158,0.6)', letterSpacing: '0.2em' }}
            >
              Đăng nhập
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-[10px] font-semibold uppercase mb-1.5"
                  style={{ color: 'rgba(168,162,158,0.6)', letterSpacing: '0.15em' }}
                >
                  Tên đăng nhập
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="Nhập tên đăng nhập"
                  className="w-full text-sm rounded-xl py-3 px-4 outline-none transition-all placeholder-stone-700"
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
                  style={{ color: 'rgba(168,162,158,0.6)', letterSpacing: '0.15em' }}
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
                    placeholder="Nhập mật khẩu"
                    className="w-full text-sm rounded-xl py-3 pl-4 pr-11 outline-none transition-all placeholder-stone-700"
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
                    {showPassword ? <EyeOffIcon /> : <EyeOnIcon />}
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
                  background: loading ? 'color-mix(in oklch, var(--t-accent) 80%, transparent)' : 'linear-gradient(135deg, var(--t-accent) 0%, var(--t-warning) 100%)',
                  color: 'var(--t-nav-active-text)',
                  boxShadow: '0 4px 24px color-mix(in oklch, var(--t-accent) 28%, transparent)',
                  letterSpacing: '0.05em',
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <span
                        className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
                        style={{ borderColor: 'color-mix(in oklch, var(--t-nav-active-text) 30%, transparent)', borderTopColor: 'var(--t-nav-active-text)' }}
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
                    style={{ background: 'linear-gradient(135deg, var(--t-accent-soft) 0%, var(--t-warning) 100%)' }}
                  />
                )}
              </button>
            </form>
          </div>

          {/* ── Role info ── */}
          <div className="px-7 pb-7">
            <div
              className="h-px mb-4"
              style={{ background: 'linear-gradient(90deg, transparent, color-mix(in oklch, var(--t-warning) 30%, transparent), transparent)' }}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <div
                className="rounded-xl p-3"
                style={{
                  background: 'rgba(18,12,7,0.7)',
                  border: '1px solid color-mix(in oklch, var(--t-warning) 20%, transparent)',
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  <span className="text-[11px] font-semibold" style={{ color: 'rgba(214,211,209,0.85)' }}>
                    Admin tổng
                  </span>
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: 'color-mix(in oklch, var(--t-warning) 75%, transparent)' }}>
                  Toàn quyền quản trị hệ thống
                </p>
              </div>
              <div
                className="rounded-xl p-3"
                style={{
                  background: 'rgba(18,12,7,0.7)',
                  border: '1px solid color-mix(in oklch, var(--t-warning) 20%, transparent)',
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0" />
                  <span className="text-[11px] font-semibold" style={{ color: 'rgba(214,211,209,0.85)' }}>
                    Quản trị chi
                  </span>
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: 'color-mix(in oklch, var(--t-warning) 75%, transparent)' }}>
                  Quản lý trong phạm vi chi họ
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center mt-5 text-[11px]" style={{ color: 'color-mix(in oklch, var(--t-warning) 50%, transparent)' }}>
          Gia Phả Họ Phùng Bát Tràng © {year}
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
