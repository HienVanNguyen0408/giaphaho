import type { Metadata } from 'next';
import FamilyTree from '@/components/public/gia-pha/FamilyTree';

export const metadata: Metadata = {
  title: 'Gia Phả',
  description: 'Sơ đồ gia phả dòng họ Phùng Bát Tràng — khám phá các thế hệ và mối quan hệ huyết thống.',
};

export default function GiaPhaPage() {
  return (
    <div style={{ height: 'calc(100vh - 80px)' }} className="w-full">
      <FamilyTree />
    </div>
  );
}
