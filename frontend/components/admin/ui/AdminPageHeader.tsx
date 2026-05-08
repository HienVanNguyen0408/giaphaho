import type { ReactNode } from 'react';

interface AdminPageHeaderProps {
  title: string;
  description?: ReactNode;
  eyebrow?: string;
  actions?: ReactNode;
  meta?: ReactNode;
}

export default function AdminPageHeader({
  title,
  description,
  eyebrow = 'Quản trị hệ thống',
  actions,
  meta,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-700">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-3xl font-bold leading-tight text-stone-950 sm:text-4xl">
          {title}
        </h1>
        {description && (
          <div className="mt-2 text-sm leading-6 text-stone-500">
            {description}
          </div>
        )}
        {meta && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {meta}
          </div>
        )}
      </div>
      {actions && (
        <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

export function AdminMetaChip({
  label,
  value,
  tone = 'stone',
}: {
  label: string;
  value: ReactNode;
  tone?: 'stone' | 'red' | 'amber' | 'blue' | 'green';
}) {
  const toneClass = {
    stone: 'bg-stone-100 text-stone-700 ring-stone-200',
    red: 'bg-red-50 text-red-800 ring-red-100',
    amber: 'bg-amber-50 text-amber-800 ring-amber-100',
    blue: 'bg-blue-50 text-blue-800 ring-blue-100',
    green: 'bg-emerald-50 text-emerald-800 ring-emerald-100',
  }[tone];

  return (
    <span className={`inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-semibold ring-1 ring-inset ${toneClass}`}>
      <span className="font-medium opacity-70">{label}</span>
      <span>{value}</span>
    </span>
  );
}
