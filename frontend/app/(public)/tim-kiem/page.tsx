import type { Metadata } from 'next';
import SearchPageClient from '@/components/public/tim-kiem/SearchPageClient';

export const metadata: Metadata = {
  title: 'Tìm kiếm',
  description: 'Tìm kiếm thành viên, tin tức và video trong gia phả dòng họ Phùng Bát Tràng.',
};

export default function SearchPage() {
  return <SearchPageClient />;
}
