'use client';

type GenderTone = 'male' | 'female' | 'unknown';

function getGenderMeta(gender: string | null | undefined): { label: string; tone: GenderTone } | null {
  const raw = gender?.trim();
  if (!raw) return null;

  const value = raw.toLowerCase();
  if (['nam', 'male', 'm'].includes(value)) return { label: 'Nam', tone: 'male' };
  if (['nữ', 'nu', 'female', 'f'].includes(value)) return { label: 'Nữ', tone: 'female' };
  return { label: raw, tone: 'unknown' };
}

function GenderGlyph({ tone }: { tone: GenderTone }) {
  if (tone === 'male') {
    return (
      <svg className="h-2.5 w-2.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <circle cx="6.2" cy="9.8" r="3.4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.7 7.3 13 3m0 0H9.6M13 3v3.4" />
      </svg>
    );
  }

  if (tone === 'female') {
    return (
      <svg className="h-2.5 w-2.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <circle cx="8" cy="5.5" r="3.4" />
        <path strokeLinecap="round" d="M8 8.9v5M5.7 11.5h4.6" />
      </svg>
    );
  }

  return (
    <svg className="h-2.5 w-2.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <circle cx="8" cy="8" r="5.2" />
      <path strokeLinecap="round" d="M8 10.4v.1M8 8.7c0-1.8 1.8-1.4 1.8-3 0-.9-.8-1.6-1.8-1.6S6.2 4.8 6.2 5.8" />
    </svg>
  );
}

export default function GenderIcon({ gender, className = '' }: { gender: string | null | undefined; className?: string }) {
  const meta = getGenderMeta(gender);
  if (!meta) return null;

  const style =
    meta.tone === 'male'
      ? { background: 'color-mix(in oklch, var(--t-info) 15%, var(--t-surface))', color: '#1d4ed8' }
      : meta.tone === 'female'
        ? { background: '#fdf2f8', color: '#be185d' }
        : { background: 'var(--t-surface-2)', color: 'var(--t-text-3)' };

  return (
    <span
      className={`inline-flex h-4 w-4 items-center justify-center rounded-full shadow-sm ${className}`}
      style={{ ...style, border: '1px solid var(--t-surface)' }}
      title={`Giới tính: ${meta.label}`}
      aria-label={`Giới tính: ${meta.label}`}
    >
      <GenderGlyph tone={meta.tone} />
    </span>
  );
}
