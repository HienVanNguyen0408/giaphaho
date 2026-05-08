function PotteryIcon() {
  return (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true" style={{ color: 'var(--t-nav-active-text)' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
    </svg>
  );
}

function ScrollIcon() {
  return (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true" style={{ color: 'var(--t-nav-active-text)' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function HandshakeIcon() {
  return (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true" style={{ color: 'var(--t-nav-active-text)' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function GraduationIcon() {
  return (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true" style={{ color: 'var(--t-nav-active-text)' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
    </svg>
  );
}

const ACHIEVEMENTS = [
  {
    icon: PotteryIcon,
    title: 'Nghề gốm truyền thống',
    description:
      'Bát Tràng nổi tiếng với nghề làm gốm sứ truyền thống hàng trăm năm, là niềm tự hào của dòng họ và cả đất nước.',
  },
  {
    icon: ScrollIcon,
    title: '500 năm lịch sử',
    description:
      'Dòng họ Phùng Bát Tràng có bề dày lịch sử hơn 500 năm, gắn liền với sự phát triển của làng nghề Bát Tràng.',
  },
  {
    icon: HandshakeIcon,
    title: 'Đoàn kết dòng họ',
    description:
      'Tinh thần đoàn kết, tương thân tương ái luôn là giá trị cốt lõi giúp dòng họ vượt qua mọi thử thách.',
  },
  {
    icon: GraduationIcon,
    title: 'Truyền thống học vấn',
    description:
      'Con cháu dòng họ luôn chú trọng việc học hành, nhiều thế hệ đỗ đạt, đóng góp cho xã hội và đất nước.',
  },
] as const;

export default function ThanhTichSection() {
  return (
    <section
      className="py-10 sm:py-16"
      aria-label="Thành tích và giá trị dòng họ"
      style={{ background: 'var(--t-surface-2)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-8 sm:mb-12">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: 'var(--t-accent)' }}
          >
            Niềm tự hào
          </p>
          <h2
            className="text-2xl sm:text-4xl font-bold mb-3"
            style={{ color: 'var(--t-text)' }}
          >
            Giá Trị Dòng Họ
          </h2>
          <div className="flex items-center justify-center gap-3" aria-hidden="true">
            <span
              className="block h-px w-12"
              style={{ background: 'var(--t-accent)' }}
            />
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 16 16"
              aria-hidden="true"
              style={{ color: 'var(--t-accent)' }}
            >
              <path d="M8 0l2.5 5.3L16 6.2l-4 3.8 1 5.5L8 12.8l-5 2.7 1-5.5-4-3.8 5.5-.9z" />
            </svg>
            <span
              className="block h-px w-12"
              style={{ background: 'var(--t-accent)' }}
            />
          </div>
        </div>

        {/* Achievement cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {ACHIEVEMENTS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col rounded-2xl p-5 transition-all duration-300 sm:p-6"
              style={{
                background: 'var(--t-surface)',
                border: '1px solid var(--t-border)',
              }}
            >
              {/* Icon */}
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-5 shrink-0"
                style={{ background: 'var(--t-accent)' }}
              >
                <Icon />
              </div>
              {/* Title */}
              <h3
                className="font-bold text-base mb-2 leading-snug"
                style={{ color: 'var(--t-text)' }}
              >
                {title}
              </h3>
              {/* Description */}
              <p
                className="text-sm leading-relaxed flex-1"
                style={{ color: 'var(--t-text-2)' }}
              >
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
