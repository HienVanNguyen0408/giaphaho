import type { Metadata } from 'next';
import VideoListClient from '@/components/public/video/VideoListClient';

export const metadata: Metadata = {
  title: 'Video',
  description: 'Thư viện video về dòng họ Phùng Bát Tràng — tư liệu hình ảnh quý giá qua các thế hệ.',
};

export default function VideoPage() {
  return (
    <div className="min-h-screen bg-stone-50 px-4 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold text-stone-900 mb-3">Thư viện Video</h1>
          <p className="text-sm leading-6 text-stone-500 max-w-xl mx-auto sm:text-base">
            Những thước phim lưu giữ ký ức và truyền thống dòng họ Phùng Bát Tràng qua các thế hệ.
          </p>
          <div className="mt-4 w-16 h-1 mx-auto rounded-full" style={{ background: 'var(--t-accent)' }} />
        </div>
        <VideoListClient />
      </div>
    </div>
  );
}
