import Link from 'next/link';

export default function HeroSection() {
  return (
    <section
      className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-red-950 via-red-900 to-amber-900"
      aria-label="Phần giới thiệu dòng họ"
    >
      {/* Background decorative circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-red-800/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-900/20 blur-2xl" />
      </div>

      {/* Ornamental top border */}
      <div
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"
        aria-hidden="true"
      />

      {/* Ornamental bottom border */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-600/60 to-transparent"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-8 max-w-4xl mx-auto py-16">
        {/* Decorative Chinese character banner */}
        <div className="flex items-center justify-center gap-3 mb-6" aria-hidden="true">
          <span className="block h-px w-16 bg-amber-500/60" />
          <span className="text-amber-400 text-2xl select-none">鳳</span>
          <span className="block h-px w-16 bg-amber-500/60" />
        </div>

        {/* Clan label */}
        <p className="text-amber-400/80 text-xs sm:text-sm uppercase tracking-[0.3em] font-medium mb-4">
          Dòng họ — Bát Tràng, Hà Nội
        </p>

        {/* Main heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight tracking-tight">
          Họ Phùng{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
            Bát Tràng
          </span>
        </h1>

        {/* Vietnamese subtitle */}
        <p className="text-stone-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-2 leading-relaxed">
          Nơi lưu giữ và tôn vinh truyền thống dòng tộc qua bao thế hệ
        </p>
        <p className="text-amber-400/70 text-sm sm:text-base italic mb-10">
          "Uống nước nhớ nguồn — Ăn quả nhớ kẻ trồng cây"
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/gia-pha"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-red-950 font-semibold px-8 py-3.5 rounded-lg shadow-lg shadow-amber-900/40 transition-all duration-200 hover:shadow-amber-700/40 hover:-translate-y-0.5 text-base"
          >
            <span>Khám Phá Gia Phả</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
          <Link
            href="/tin-tuc"
            className="inline-flex items-center gap-2 border border-amber-500/50 text-amber-300 hover:border-amber-400 hover:text-amber-200 px-8 py-3.5 rounded-lg transition-all duration-200 text-base"
          >
            Xem Tin Tức
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-14 grid grid-cols-3 gap-6 max-w-lg mx-auto text-center">
          {[
            { value: '500+', label: 'Năm lịch sử' },
            { value: '1000+', label: 'Thành viên' },
            { value: '10+', label: 'Thế hệ' },
          ].map(({ value, label }) => (
            <div key={label} className="group">
              <p className="text-amber-400 font-bold text-2xl sm:text-3xl">{value}</p>
              <p className="text-stone-400 text-xs sm:text-sm mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
