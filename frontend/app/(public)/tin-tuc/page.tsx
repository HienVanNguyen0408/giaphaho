import type { Metadata } from 'next';
import NewsListClient from '@/components/public/news/NewsListClient';

export const metadata: Metadata = {
  title: 'Tin tức',
  description: 'Cập nhật tin tức, sự kiện và thông báo từ dòng họ Phùng Bát Tràng.',
};

export default function TinTucPage() {
  return (
    <div className="min-h-screen bg-stone-50 px-4 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold text-stone-900 mb-3">Tin tức & Sự kiện</h1>
          <p className="text-sm leading-6 text-stone-500 max-w-xl mx-auto sm:text-base">
            Cập nhật những tin tức, sự kiện và hoạt động mới nhất của dòng họ Phùng Bát Tràng.
          </p>
          <div className="mt-4 w-16 h-1 mx-auto rounded-full" style={{ background: 'var(--t-accent)' }} />
        </div>
        <NewsListClient />
      </div>
    </div>
  );
}
