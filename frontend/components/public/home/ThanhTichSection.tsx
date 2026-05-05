const ACHIEVEMENTS = [
  {
    icon: '🏺',
    title: 'Nghề gốm truyền thống',
    description:
      'Bát Tràng nổi tiếng với nghề làm gốm sứ truyền thống hàng trăm năm, là niềm tự hào của dòng họ và cả đất nước.',
  },
  {
    icon: '📜',
    title: '500 năm lịch sử',
    description:
      'Dòng họ Phùng Bát Tràng có bề dày lịch sử hơn 500 năm, gắn liền với sự phát triển của làng nghề Bát Tràng.',
  },
  {
    icon: '🤝',
    title: 'Đoàn kết dòng họ',
    description:
      'Tinh thần đoàn kết, tương thân tương ái luôn là giá trị cốt lõi giúp dòng họ vượt qua mọi thử thách.',
  },
  {
    icon: '🎓',
    title: 'Truyền thống học vấn',
    description:
      'Con cháu dòng họ luôn chú trọng việc học hành, nhiều thế hệ đỗ đạt, đóng góp cho xã hội và đất nước.',
  },
] as const;

export default function ThanhTichSection() {
  return (
    <section
      className="py-16 bg-gradient-to-b from-stone-50 to-amber-50/50"
      aria-label="Thành tích và giá trị dòng họ"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-amber-600 text-xs font-semibold uppercase tracking-widest mb-2">
            Niềm tự hào
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-3">
            Giá Trị Dòng Họ
          </h2>
          <div className="flex items-center justify-center gap-3" aria-hidden="true">
            <span className="block h-px w-12 bg-amber-400" />
            <span className="text-amber-500 text-lg">✦</span>
            <span className="block h-px w-12 bg-amber-400" />
          </div>
        </div>

        {/* Achievement cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ACHIEVEMENTS.map(({ icon, title, description }) => (
            <div
              key={title}
              className="group bg-white rounded-2xl p-6 shadow-sm shadow-stone-200 border border-stone-100 hover:shadow-md hover:shadow-amber-100/60 hover:border-amber-200 transition-all duration-300 flex flex-col"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-900 to-red-800 flex items-center justify-center text-2xl mb-5 shadow-sm group-hover:from-amber-600 group-hover:to-amber-700 transition-all duration-300">
                <span role="img" aria-label={title}>{icon}</span>
              </div>
              {/* Title */}
              <h3 className="text-stone-900 font-bold text-base mb-2 leading-snug">{title}</h3>
              {/* Description */}
              <p className="text-stone-500 text-sm leading-relaxed flex-1">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
