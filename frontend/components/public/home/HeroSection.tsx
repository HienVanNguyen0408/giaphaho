import type { DashboardStats } from '@/types';
import HeroSearchWidget from './HeroSearchWidget';

export default function HeroSection({ stats }: { stats: DashboardStats | null }) {
  const memberCount = stats?.totalMembers ? `${stats.totalMembers}+` : '1500+';

  return (
    <section
      className="relative overflow-hidden"
      aria-label="Phần giới thiệu dòng họ"
    >
      {/* ── Dark hero background ── */}
      <div className="relative bg-gradient-to-br from-red-950 via-red-900 to-amber-900">
        {/* Decorative blurs — clipped by section overflow-hidden */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute top-1/3 right-0 w-[350px] h-[350px] rounded-full bg-red-800/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[300px] rounded-full bg-amber-900/20 blur-2xl" />
          {/* Subtle grid pattern */}
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.04]"
            aria-hidden="true"
          >
            <defs>
              <pattern id="hero-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#f59e0b" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>
          {/* Bottom fade to transparent so widget blends cleanly */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        {/* Ornamental top border */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{
            background:
              'linear-gradient(90deg, transparent 5%, var(--t-gold) 40%, var(--t-gold) 60%, transparent 95%)',
          }}
          aria-hidden="true"
        />

        {/* Hero content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 sm:pb-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Ornament */}
            <div className="flex items-center justify-center gap-3 mb-5" aria-hidden="true">
              <span className="block h-px w-16 bg-amber-500/50" />
              <span className="text-amber-400 text-3xl select-none">鳳</span>
              <span className="block h-px w-16 bg-amber-500/50" />
            </div>

            {/* Clan label */}
            <p className="text-amber-300/80 text-xs sm:text-sm uppercase tracking-[0.3em] font-medium mb-4">
              Dòng họ · Bát Tràng, Hà Nội
            </p>

            {/* Main heading */}
            <h1
              id="hero-title"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight tracking-tight"
            >
              Họ Phùng{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                Bát Tràng
              </span>
            </h1>

            {/* Tagline */}
            <p className="text-stone-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-2 leading-relaxed">
              Nơi lưu giữ và tôn vinh truyền thống dòng tộc qua bao thế hệ
            </p>
            <p className="text-amber-400/60 text-sm sm:text-base italic mb-10">
              &ldquo;Uống nước nhớ nguồn — Ăn quả nhớ kẻ trồng cây&rdquo;
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-md mx-auto">
              {[
                { value: '600+', label: 'Năm lịch sử' },
                { value: memberCount, label: 'Thành viên' },
                { value: '30+', label: 'Thế hệ' },
              ].map(({ value, label }, i) => (
                <div key={label} className="relative text-center">
                  {i > 0 && (
                    <span
                      className="absolute top-1/2 -left-0.5 -translate-y-1/2 h-8 w-px opacity-40"
                      style={{ background: 'var(--t-gold)' }}
                      aria-hidden="true"
                    />
                  )}
                  <p className="text-amber-400 font-bold text-2xl sm:text-3xl">{value}</p>
                  <p className="text-stone-400 text-xs sm:text-sm mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Search widget — overlaps hero bottom by 40px (VNA booking form style) ── */}
      {/*    section.overflow-hidden clips the decorative blurs above,              */}
      {/*    not the widget since it's within the section bounds.                   */}
      <div
        className="relative z-20 -mt-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"
        aria-label="Tìm kiếm và khám phá"
      >
        <HeroSearchWidget />
      </div>
    </section>
  );
}
