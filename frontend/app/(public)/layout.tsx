import Header from '@/components/public/layout/Header';
import Footer from '@/components/public/layout/Footer';
import AnalyticsTracker from '@/components/public/AnalyticsTracker';
import { Suspense } from 'react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
      <Header />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
}
