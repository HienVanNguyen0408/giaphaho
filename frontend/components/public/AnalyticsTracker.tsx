'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackAnalyticsEvent } from '@/lib/api';

const VISITOR_KEY = 'giaphaho_visitor_id';

function getVisitorId(): string {
  try {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return 'anonymous';
  }
}

function getTarget(pathname: string): { targetType?: string; targetId?: string } {
  if (pathname.startsWith('/tin-tuc/')) {
    return { targetType: 'news', targetId: decodeURIComponent(pathname.split('/').filter(Boolean).at(-1) ?? '') };
  }
  if (pathname.startsWith('/tin-tuc')) return { targetType: 'news_list' };
  if (pathname.startsWith('/video')) return { targetType: 'video' };
  if (pathname.startsWith('/gia-pha')) return { targetType: 'family_tree' };
  if (pathname.startsWith('/thanh-vien/')) {
    return { targetType: 'member', targetId: pathname.split('/').filter(Boolean).at(-1) };
  }
  if (pathname.startsWith('/tim-kiem')) return { targetType: 'search' };
  return { targetType: 'page' };
}

export function trackPublicEvent(eventType: string, data: { path?: string; title?: string; targetType?: string; targetId?: string }) {
  if (typeof window === 'undefined') return;
  const path = data.path ?? `${window.location.pathname}${window.location.search}`;
  void trackAnalyticsEvent({
    eventType,
    path,
    title: data.title ?? document.title,
    targetType: data.targetType,
    targetId: data.targetId,
    visitorId: getVisitorId(),
    referrer: document.referrer || undefined,
  });
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    const timer = window.setTimeout(() => {
      trackPublicEvent('page_view', {
        path,
        title: document.title,
        ...getTarget(pathname),
      });
    }, 500);

    return () => window.clearTimeout(timer);
  }, [pathname, searchParams]);

  return null;
}
