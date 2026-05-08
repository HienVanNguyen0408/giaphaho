import Link from 'next/link';

const SERVICES = [
  {
    href: '/gia-pha',
    label: 'Gia Phả',
    desc: 'Cây dòng tộc',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7" aria-hidden="true">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
  },
  {
    href: '/tim-kiem',
    label: 'Tìm Kiếm',
    desc: 'Tra cứu thành viên',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
  {
    href: '/tin-tuc',
    label: 'Tin Tức',
    desc: 'Hoạt động dòng họ',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7" aria-hidden="true">
        <path d="M4 6h16M4 10h16M4 14h10M4 18h8" />
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    ),
  },
  {
    href: '/video',
    label: 'Video',
    desc: 'Hình ảnh & âm thanh',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7" aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M10 9l5 3-5 3V9z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: '/tim-kiem',
    label: 'Liên Hệ',
    desc: 'Hỗ trợ dòng họ',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.72A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
  },
] as const;

export default function QuickServicesSection() {
  return (
    <section
      aria-label="Dịch vụ nhanh"
      className="py-5 sm:py-8"
      style={{ background: 'var(--t-surface)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-3">
          {SERVICES.map(({ href, label, desc, icon }) => (
            <Link
              key={label}
              href={href}
              className="quick-service-card group flex flex-col items-center gap-2.5 rounded-xl px-3 py-4 sm:py-5"
              style={{
                background: 'var(--t-bg)',
                border: '1px solid var(--t-border)',
              }}
            >
              <span
                className="transition-colors duration-200"
                style={{ color: 'var(--t-accent)' }}
              >
                {icon}
              </span>
              <div className="text-center">
                <p
                  className="font-semibold text-xs sm:text-sm leading-tight"
                  style={{ color: 'var(--t-text)' }}
                >
                  {label}
                </p>
                <p
                  className="text-[10px] sm:text-xs mt-0.5 hidden sm:block"
                  style={{ color: 'var(--t-text-3)' }}
                >
                  {desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
