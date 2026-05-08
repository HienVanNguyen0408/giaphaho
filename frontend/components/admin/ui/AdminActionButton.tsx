'use client';

import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';

type ActionTone = 'neutral' | 'red' | 'amber' | 'blue' | 'green';

interface ToneConfig {
  button: CSSProperties;
  tooltip: CSSProperties;
  arrow: string;
}

const toneConfig: Record<ActionTone, ToneConfig> = {
  neutral: {
    button: {
      background: 'var(--t-surface-2)',
      borderColor: 'var(--t-border)',
      color: 'var(--t-text-2)',
    },
    tooltip: { background: 'var(--t-text)', color: 'var(--t-surface)' },
    arrow: 'var(--t-text)',
  },
  red: {
    button: {
      background: 'color-mix(in oklch, var(--t-error) 10%, transparent)',
      borderColor: 'color-mix(in oklch, var(--t-error) 30%, transparent)',
      color: 'var(--t-error)',
    },
    tooltip: { background: 'var(--t-error)', color: 'white' },
    arrow: 'var(--t-error)',
  },
  blue: {
    button: {
      background: 'color-mix(in oklch, var(--t-info) 10%, transparent)',
      borderColor: 'color-mix(in oklch, var(--t-info) 30%, transparent)',
      color: 'var(--t-info)',
    },
    tooltip: { background: 'var(--t-info)', color: 'white' },
    arrow: 'var(--t-info)',
  },
  amber: {
    button: {
      background: 'color-mix(in oklch, var(--t-warning) 10%, transparent)',
      borderColor: 'color-mix(in oklch, var(--t-warning) 30%, transparent)',
      color: 'var(--t-warning)',
    },
    tooltip: { background: 'var(--t-warning)', color: 'white' },
    arrow: 'var(--t-warning)',
  },
  green: {
    button: {
      background: 'color-mix(in oklch, var(--t-success) 10%, transparent)',
      borderColor: 'color-mix(in oklch, var(--t-success) 30%, transparent)',
      color: 'var(--t-success)',
    },
    tooltip: { background: 'var(--t-success)', color: 'white' },
    arrow: 'var(--t-success)',
  },
};

const buttonClass =
  'group relative grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg border transition-all focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 hover:brightness-95 active:scale-95';

function Tooltip({ label, tooltipStyle, arrowColor }: { label: string; tooltipStyle: CSSProperties; arrowColor: string }) {
  return (
    <span
      className="pointer-events-none absolute right-full top-1/2 z-50 mr-2 -translate-y-1/2 flex items-center whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-semibold opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
      style={tooltipStyle}
    >
      {label}
      <span
        className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent"
        style={{ borderLeftColor: arrowColor }}
      />
    </span>
  );
}

interface BaseProps {
  label: string;
  children: ReactNode;
  tone?: ActionTone;
  disabled?: boolean;
}

interface ButtonProps extends BaseProps {
  onClick?: () => void;
}

interface LinkProps extends BaseProps {
  href: string;
}

export function AdminActionButton({ label, children, onClick, disabled, tone = 'neutral' }: ButtonProps) {
  const { button, tooltip, arrow } = toneConfig[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={buttonClass}
      style={button}
    >
      {children}
      <Tooltip label={label} tooltipStyle={tooltip} arrowColor={arrow} />
    </button>
  );
}

export function AdminActionLink({ label, children, href, tone = 'neutral' }: LinkProps) {
  const { button, tooltip, arrow } = toneConfig[tone];
  return (
    <Link
      href={href}
      aria-label={label}
      className={buttonClass}
      style={button}
    >
      {children}
      <Tooltip label={label} tooltipStyle={tooltip} arrowColor={arrow} />
    </Link>
  );
}
