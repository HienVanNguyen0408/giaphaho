import Header from '@/components/public/layout/Header';
import Footer from '@/components/public/layout/Footer';
import ThemeSwitcher from '@/components/shared/ThemeSwitcher';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ThemeSwitcher />
    </div>
  );
}
