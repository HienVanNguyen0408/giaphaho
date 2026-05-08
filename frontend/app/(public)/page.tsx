import type { Metadata } from 'next';
import { cacheLife } from 'next/cache';
import { getPinnedNews, getVideos, getSections, getNewsList, getDashboard } from '@/lib/api';

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
import type { NewsListItem, Video, Section, DashboardStats } from '@/types';

async function getHomeData(): Promise<{
  pinnedNews: NewsListItem[];
  recentNews: NewsListItem[];
  videos: Video[];
  sections: Section[];
  stats: DashboardStats | null;
}> {
  'use cache';
  cacheLife('minutes');

  const [pinnedRes, newsRes, videosRes, sectionsRes, statsRes] = await Promise.allSettled([
    getPinnedNews(),
    getNewsList(1, 3),
    getVideos(),
    getSections(),
    getDashboard(),
  ]);

  const pinnedNews =
    pinnedRes.status === 'fulfilled' ? pinnedRes.value.data : [];
  const recentNews =
    newsRes.status === 'fulfilled' ? newsRes.value.data.items : [];
  const videos =
    videosRes.status === 'fulfilled'
      ? videosRes.value.data.slice(0, 3)
      : [];
  const sections =
    sectionsRes.status === 'fulfilled' ? sectionsRes.value.data : [];
  const stats =
    statsRes.status === 'fulfilled' ? statsRes.value.data : null;

  return { pinnedNews, recentNews, videos, sections, stats };
}

export default async function HomePage() {
  const { pinnedNews, recentNews, videos, sections, stats } = await getHomeData();

  return (
    <>
      {/* 1. Hero + Search widget (VNA booking form style) */}
      <HeroSection stats={stats} />

      {/* 2. Quick services row (VNA quick services bar) */}
      <QuickServicesSection />

      {/* 3. Tin nổi bật (VNA "Ưu đãi nổi bật" deal cards) */}
      <TinNoiBat news={pinnedNews} />

      {/* 4. Giá trị dòng họ */}
      <ThanhTichSection />

      {/* 5. Tin tức dòng họ */}
      <TinTucSection news={recentNews} />

      {/* 6. Video */}
      <VideoSection videos={videos} />

      {/* 7. Chuyên mục động */}
      <DynamicSection sections={sections} />
    </>
  );
}
