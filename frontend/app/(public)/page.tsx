import type { Metadata } from 'next';
import { Suspense } from 'react';
import { cacheLife } from 'next/cache';
import { getPinnedNews, getVideoList, getSections, getNewsList, getDashboard } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Trang chủ',
  description: 'Website lưu giữ và phát huy truyền thống dòng họ Phùng Bát Tràng — gia phả, tin tức, và tư liệu lịch sử.',
};

import HeroSection from '@/components/public/home/HeroSection';
import QuickServicesSection from '@/components/public/home/QuickServicesSection';
import TinNoiBat from '@/components/public/home/TinNoiBat';
import ThanhTichSection from '@/components/public/home/ThanhTichSection';
import TinTucSection from '@/components/public/home/TinTucSection';
import VideoSection from '@/components/public/home/VideoSection';
import DynamicSection from '@/components/public/home/DynamicSection';
import type { Section } from '@/types';

// ── Skeletons ─────────────────────────────────────────────────

function HeroSkeleton() {
  return (
    <div className="animate-pulse" style={{ background: 'var(--t-nav-bg)', minHeight: 320 }} />
  );
}

function CardsSkeleton() {
  return (
    <section className="py-10 sm:py-14" style={{ background: 'var(--t-surface-2)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse mb-6 sm:mb-8">
          <div className="h-3 rounded-full w-16 mb-2" style={{ background: 'var(--t-border)' }} />
          <div className="h-7 rounded-lg w-48" style={{ background: 'var(--t-border)' }} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden animate-pulse"
              style={{ background: 'var(--t-surface)', border: '1px solid var(--t-border)' }}
            >
              <div className="aspect-[16/9]" style={{ background: 'var(--t-surface-2)' }} />
              <div className="p-4 space-y-2">
                <div className="h-2.5 rounded w-1/4" style={{ background: 'var(--t-border)' }} />
                <div className="h-4 rounded w-full" style={{ background: 'var(--t-border)' }} />
                <div className="h-4 rounded w-3/4" style={{ background: 'var(--t-border)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Async streaming components ────────────────────────────────

async function HeroContent() {
  'use cache';
  cacheLife('minutes');
  try {
    const res = await getDashboard();
    return <HeroSection stats={res.data} />;
  } catch {
    return <HeroSection stats={null} />;
  }
}

async function PinnedNewsContent() {
  'use cache';
  cacheLife('minutes');
  try {
    const res = await getPinnedNews();
    if (!res.data?.length) return null;
    return <TinNoiBat news={res.data} />;
  } catch {
    return null;
  }
}

async function RecentNewsContent() {
  'use cache';
  cacheLife('minutes');
  try {
    const res = await getNewsList(1, 3);
    return <TinTucSection initialNews={res.data.items ?? []} totalPages={res.data.totalPages} />;
  } catch {
    return <TinTucSection initialNews={[]} totalPages={1} />;
  }
}

async function VideosContent() {
  'use cache';
  cacheLife('minutes');
  try {
    const res = await getVideoList(1, 3);
    if (!res.data.items.length) return null;
    return <VideoSection initialVideos={res.data.items} totalPages={res.data.totalPages} />;
  } catch {
    return null;
  }
}

// ── Sections config (structural, should be fast) ──────────────

async function fetchSections(): Promise<Section[]> {
  'use cache';
  cacheLife('minutes');
  try {
    const res = await getSections();
    return res.data;
  } catch {
    return [];
  }
}

const TYPED_SECTION_TYPES = new Set(['TIN_NOI_BAT', 'THANH_TICH', 'TIN_TUC', 'VIDEO']);

// ── Page ──────────────────────────────────────────────────────

export default async function HomePage() {
  const sections = await fetchSections();

  const activeSections = sections
    .filter((s) => s.isActive)
    .sort((a, b) => a.order - b.order);

  const hasTypedSections = activeSections.some((s) => s.type && TYPED_SECTION_TYPES.has(s.type));
  const customSections = activeSections.filter((s) => !s.type || s.type === 'CUSTOM');

  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <HeroContent />
      </Suspense>

      <QuickServicesSection />

      {hasTypedSections ? (
        activeSections.map((section) => {
          if (section.type === 'TIN_NOI_BAT')
            return (
              <Suspense key={section.id} fallback={<CardsSkeleton />}>
                <PinnedNewsContent />
              </Suspense>
            );
          if (section.type === 'THANH_TICH')
            return <ThanhTichSection key={section.id} />;
          if (section.type === 'TIN_TUC')
            return (
              <Suspense key={section.id} fallback={<CardsSkeleton />}>
                <RecentNewsContent />
              </Suspense>
            );
          if (section.type === 'VIDEO')
            return (
              <Suspense key={section.id} fallback={<CardsSkeleton />}>
                <VideosContent />
              </Suspense>
            );
          return null;
        })
      ) : (
        <>
          <Suspense fallback={<CardsSkeleton />}>
            <PinnedNewsContent />
          </Suspense>
          <ThanhTichSection />
          <Suspense fallback={<CardsSkeleton />}>
            <RecentNewsContent />
          </Suspense>
          <Suspense fallback={<CardsSkeleton />}>
            <VideosContent />
          </Suspense>
        </>
      )}

      {customSections.length > 0 && <DynamicSection sections={customSections} />}
    </>
  );
}
