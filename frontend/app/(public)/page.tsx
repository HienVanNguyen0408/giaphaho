import type { Metadata } from 'next';
import { cacheLife } from 'next/cache';
import { getPinnedNews, getVideos, getSections, getNewsList } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Trang chủ',
  description: 'Website lưu giữ và phát huy truyền thống dòng họ Phùng Bát Tràng — gia phả, tin tức, và tư liệu lịch sử.',
};
import HeroSection from '@/components/public/home/HeroSection';
import TinNoiBat from '@/components/public/home/TinNoiBat';
import ThanhTichSection from '@/components/public/home/ThanhTichSection';
import TinTucSection from '@/components/public/home/TinTucSection';
import VideoSection from '@/components/public/home/VideoSection';
import DynamicSection from '@/components/public/home/DynamicSection';
import type { NewsListItem, Video, Section } from '@/types';

async function getHomeData(): Promise<{
  pinnedNews: NewsListItem[];
  recentNews: NewsListItem[];
  videos: Video[];
  sections: Section[];
}> {
  'use cache';
  cacheLife('hours');

  const [pinnedRes, newsRes, videosRes, sectionsRes] = await Promise.allSettled([
    getPinnedNews(),
    getNewsList(1, 3),
    getVideos(),
    getSections(),
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

  return { pinnedNews, recentNews, videos, sections };
}

export default async function HomePage() {
  const { pinnedNews, recentNews, videos, sections } = await getHomeData();

  return (
    <>
      <HeroSection />
      <TinNoiBat news={pinnedNews} />
      <ThanhTichSection />
      <TinTucSection news={recentNews} />
      <VideoSection videos={videos} />
      <DynamicSection sections={sections} />
    </>
  );
}
