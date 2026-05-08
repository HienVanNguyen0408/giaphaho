import type { DashboardStats } from '@/types';
import HeroSearchWidget from './HeroSearchWidget';

export default function HeroSection({ stats }: { stats: DashboardStats | null }) {
  const memberCount = stats?.totalMembers ? `${stats.totalMembers}+` : '1500+';

  return (
    <section
      className="relative overflow-hidden"
      aria-label="Phần giới thiệu dòng họ"
      style={{ background: 'var(--t-bg)' }}
    >
      {/* Hero content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 sm:pt-14 sm:pb-20">
        <div className="text-center max-w-4xl mx-auto">

          {/* Ornament */}
          <div className="flex items-center justify-center gap-3 mb-4 sm:mb-5" aria-hidden="true">
            <span
              className="block h-px w-10 sm:w-16"
              style={{ background: 'color-mix(in oklch, var(--t-accent) 40%, transparent)' }}
            />
            <span
              className="text-2xl sm:text-3xl select-none"
              style={{ color: 'var(--t-accent)' }}
            >
              鳳
            </span>
            <span
              className="block h-px w-10 sm:w-16"
              style={{ background: 'color-mix(in oklch, var(--t-accent) 40%, transparent)' }}
            />
          </div>

          {/* Clan label */}
          <p
            className="text-[11px] sm:text-sm uppercase tracking-[0.22em] sm:tracking-[0.3em] font-medium mb-3 sm:mb-4"
            style={{ color: 'var(--t-text-3)' }}
          >
            Dòng họ · Bát Tràng, Hà Nội
          </p>

          {/* Main heading */}
          <h1
            id="hero-title"
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight tracking-tight"
            style={{ color: 'var(--t-text)' }}
          >
            Họ Phùng{' '}
            <span style={{ color: 'var(--t-accent)' }}>Bát Tràng</span>
          </h1>

          {/* Tagline */}
          <p
            className="text-sm sm:text-lg md:text-xl max-w-2xl mx-auto mb-2 leading-relaxed"
            style={{ color: 'var(--t-text-2)' }}
          >
            Nơi lưu giữ và tôn vinh truyền thống dòng tộc qua bao thế hệ
          </p>
          <p
            className="text-xs sm:text-base italic mb-8 sm:mb-10"
            style={{ color: 'var(--t-text-3)' }}
          >
            &ldquo;Uống nước nhớ nguồn — Ăn quả nhớ kẻ trồng cây&rdquo;
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-8 max-w-md mx-auto">
            {[
              { value: '600+', label: 'Năm lịch sử' },
              { value: memberCount, label: 'Thành viên' },
              { value: '30+', label: 'Thế hệ' },
            ].map(({ value, label }, i) => (
              <div key={label} className="relative text-center">
                {i > 0 && (
                  <span
                    className="absolute top-1/2 -left-0.5 -translate-y-1/2 h-8 w-px"
                    style={{ background: 'color-mix(in oklch, var(--t-border) 80%, transparent)' }}
                    aria-hidden="true"
                  />
                )}
                <p
                  className="font-bold text-xl sm:text-3xl"
                  style={{ color: 'var(--t-accent)' }}
                >
                  {value}
                </p>
                <p
                  className="text-[11px] sm:text-sm mt-0.5 leading-tight"
                  style={{ color: 'var(--t-text-3)' }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search widget */}
      <div
        className="relative z-20 -mt-8 max-w-5xl mx-auto px-3 sm:-mt-10 sm:px-6 lg:px-8 pb-6 sm:pb-8"
        aria-label="Tìm kiếm và khám phá"
      >
        <HeroSearchWidget />
      </div>
    </section>
  );
}
