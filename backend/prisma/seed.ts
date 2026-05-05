import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.warn('Seeding database...');

  // ── Users ──────────────────────────────────────────────────────────────────
  const hashed = await bcrypt.hash('changeme123', 12);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: hashed, role: 'SUPER_ADMIN' },
  });
  console.warn('User:', admin.username);

  const chiAdmin = await prisma.user.upsert({
    where: { username: 'chi_truong' },
    update: {},
    create: { username: 'chi_truong', password: hashed, role: 'CHI_ADMIN' },
  });
  console.warn('User:', chiAdmin.username);

  // ── Members ────────────────────────────────────────────────────────────────
  const founder = await prisma.member.upsert({
    where: { id: '000000000000000000000001' },
    update: {},
    create: {
      id: '000000000000000000000001',
      fullName: 'Phùng Tổ',
      birthYear: 1800,
      gender: 'Nam',
      bio: 'Thủy tổ dòng họ Phùng Bát Tràng, người đặt nền móng cho làng nghề gốm sứ truyền thống.',
      achievements: [
        'Khai sáng dòng họ Phùng tại Bát Tràng',
        'Truyền nghề gốm cho ba đời con cháu',
      ],
    },
  });
  console.warn('Member:', founder.fullName);

  await prisma.member.upsert({
    where: { id: '000000000000000000000002' },
    update: {},
    create: {
      id: '000000000000000000000002',
      fullName: 'Phùng Văn Thịnh',
      birthYear: 1835,
      deathYear: 1910,
      gender: 'Nam',
      parentId: '000000000000000000000001',
      bio: 'Con trưởng của Phùng Tổ, kế thừa và mở rộng xưởng gốm.',
      achievements: ['Mở rộng xưởng gốm Phùng', 'Đào tạo hơn 20 thợ gốm'],
    },
  });

  await prisma.member.upsert({
    where: { id: '000000000000000000000003' },
    update: {},
    create: {
      id: '000000000000000000000003',
      fullName: 'Phùng Thị Lan',
      birthYear: 1840,
      deathYear: 1915,
      gender: 'Nữ',
      parentId: '000000000000000000000001',
      bio: 'Con gái thứ của Phùng Tổ, nổi tiếng với nghề vẽ hoa văn gốm.',
    },
  });

  await prisma.member.upsert({
    where: { id: '000000000000000000000004' },
    update: {},
    create: {
      id: '000000000000000000000004',
      fullName: 'Phùng Văn Minh',
      birthYear: 1868,
      deathYear: 1945,
      gender: 'Nam',
      parentId: '000000000000000000000002',
      bio: 'Cháu đích tôn, đưa gốm Phùng Bát Tràng lên tầm cao mới.',
      achievements: ['Đạt giải Nhất Triển lãm Thủ công Hà Nội 1910'],
    },
  });

  await prisma.member.upsert({
    where: { id: '000000000000000000000005' },
    update: {},
    create: {
      id: '000000000000000000000005',
      fullName: 'Phùng Văn Đức',
      birthYear: 1900,
      deathYear: 1975,
      gender: 'Nam',
      parentId: '000000000000000000000004',
      bio: 'Người bảo tồn nghề gốm qua thời kỳ chiến tranh.',
      achievements: ['Nghệ nhân gốm được Nhà nước vinh danh năm 1960'],
    },
  });

  // ── Footer ─────────────────────────────────────────────────────────────────
  await prisma.footerConfig.upsert({
    where: { id: '000000000000000000000010' },
    update: {
      contact: 'Email: giapha@phungbattrang.vn | ĐT: 0123 456 789 | Địa chỉ: Bát Tràng, Gia Lâm, Hà Nội',
      description:
        'Website lưu giữ và phát huy truyền thống dòng họ Phùng Bát Tràng — nơi kết nối con cháu muôn phương về cội nguồn.',
      copyright: '© 2026 Dòng họ Phùng Bát Tràng. All rights reserved.',
    },
    create: {
      id: '000000000000000000000010',
      contact: 'Email: giapha@phungbattrang.vn | ĐT: 0123 456 789 | Địa chỉ: Bát Tràng, Gia Lâm, Hà Nội',
      description:
        'Website lưu giữ và phát huy truyền thống dòng họ Phùng Bát Tràng — nơi kết nối con cháu muôn phương về cội nguồn.',
      copyright: '© 2026 Dòng họ Phùng Bát Tràng. All rights reserved.',
    },
  });
  console.warn('Footer config seeded.');

  // ── News ───────────────────────────────────────────────────────────────────
  const newsData = [
    {
      slug: 'gio-to-dong-ho-2026',
      title: 'Giỗ tổ dòng họ Phùng Bát Tràng 2026',
      content: `<h2>Thông báo Giỗ tổ dòng họ năm 2026</h2>
<p>Ngày <strong>15 tháng 3 âm lịch</strong> năm Bính Ngọ 2026, toàn thể con cháu họ Phùng khắp nơi tập trung về Bát Tràng để tham dự lễ Giỗ tổ thường niên.</p>
<p>Ban tổ chức kính mời tất cả con cháu trong dòng họ về dự lễ đúng giờ. Lễ vật dâng cúng tổ tiên gồm các sản phẩm gốm truyền thống do chính tay con cháu làm ra.</p>
<h3>Chương trình</h3>
<ul>
  <li>7:00 – Tập trung tại nhà thờ họ</li>
  <li>8:00 – Lễ dâng hương</li>
  <li>10:00 – Hội họp, thăm hỏi nhau</li>
  <li>12:00 – Cỗ giỗ</li>
</ul>`,
      isPinned: true,
    },
    {
      slug: 'hop-mat-chi-truong-2026',
      title: 'Họp mặt chi trưởng các dòng họ năm 2026',
      content: `<h2>Họp mặt chi trưởng thường niên</h2>
<p>Buổi họp mặt thường niên giữa các chi trưởng diễn ra vào ngày <strong>20 tháng 1 âm lịch</strong> tại nhà thờ họ Phùng.</p>
<p>Các nội dung thảo luận bao gồm: tổng kết hoạt động năm qua, kế hoạch hoạt động năm mới, và vấn đề quỹ họ.</p>`,
      isPinned: false,
    },
    {
      slug: 'tu-suong-bieu-duong-2025',
      title: 'Tuyên dương con cháu học giỏi, đỗ đại học năm 2025',
      content: `<h2>Tuyên dương học sinh, sinh viên xuất sắc</h2>
<p>Nhân dịp đầu năm mới, Ban liên lạc dòng họ Phùng Bát Tràng trân trọng biểu dương <strong>23 con cháu</strong> đạt thành tích học tập xuất sắc năm học 2024–2025.</p>
<p>Đặc biệt có 5 em đỗ vào các trường đại học top đầu cả nước: Đại học Bách Khoa, Đại học Y Hà Nội, Học viện Ngoại giao...</p>
<p>Dòng họ sẽ trao học bổng khuyến học cho các em có thành tích xuất sắc.</p>`,
      isPinned: true,
    },
    {
      slug: 'bao-ton-nghe-gom-bat-trang',
      title: 'Dự án bảo tồn nghề gốm truyền thống Bát Tràng của dòng họ Phùng',
      content: `<h2>Bảo tồn di sản gốm Phùng Bát Tràng</h2>
<p>Dòng họ Phùng khởi động dự án <strong>"Lưu giữ hồn gốm Bát Tràng"</strong> nhằm bảo tồn những kỹ thuật làm gốm cổ truyền qua nhiều thế hệ.</p>
<p>Dự án bao gồm việc lập hồ sơ kỹ thuật, tổ chức lớp học nghề cho con cháu, và xây dựng bộ sưu tập gốm lịch sử của dòng họ.</p>`,
      isPinned: false,
    },
    {
      slug: 'quy-khuyen-hoc-2026',
      title: 'Thông báo quỹ khuyến học dòng họ Phùng năm 2026',
      content: `<h2>Quỹ Khuyến học Phùng Bát Tràng</h2>
<p>Quỹ Khuyến học dòng họ Phùng Bát Tràng năm 2026 đã nhận được sự ủng hộ nhiệt tình từ con cháu khắp nơi, tổng số tiền quyên góp đạt <strong>150 triệu đồng</strong>.</p>
<p>Quỹ sẽ trao học bổng cho 30 con em trong dòng họ có hoàn cảnh khó khăn nhưng học tập tốt trong năm học 2025–2026.</p>`,
      isPinned: false,
    },
  ];

  for (const n of newsData) {
    await prisma.news.upsert({
      where: { slug: n.slug },
      update: {},
      create: n,
    });
  }
  console.warn(`Seeded ${newsData.length} news articles.`);

  // ── Videos ─────────────────────────────────────────────────────────────────
  const videoData = [
    {
      id: '000000000000000000000020',
      title: 'Lễ giỗ tổ dòng họ Phùng Bát Tràng 2025',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      order: 1,
    },
    {
      id: '000000000000000000000021',
      title: 'Bát Tràng – Làng nghề gốm truyền thống nghìn năm tuổi',
      youtubeUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
      thumbnailUrl: 'https://img.youtube.com/vi/ScMzIvxBSi4/hqdefault.jpg',
      order: 2,
    },
    {
      id: '000000000000000000000022',
      title: 'Họp mặt con cháu dòng họ Phùng – Tết Ất Tỵ 2025',
      youtubeUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      thumbnailUrl: 'https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg',
      order: 3,
    },
    {
      id: '000000000000000000000023',
      title: 'Trao học bổng khuyến học dòng họ Phùng năm 2025',
      youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
      thumbnailUrl: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
      order: 4,
    },
    {
      id: '000000000000000000000024',
      title: 'Tham quan nhà thờ họ và khu trưng bày gốm cổ',
      youtubeUrl: 'https://www.youtube.com/watch?v=CevxZvSJLk8',
      thumbnailUrl: 'https://img.youtube.com/vi/CevxZvSJLk8/hqdefault.jpg',
      order: 5,
    },
  ];

  for (const v of videoData) {
    await prisma.video.upsert({
      where: { id: v.id },
      update: {},
      create: v,
    });
  }
  console.warn(`Seeded ${videoData.length} videos.`);

  // ── Sections (homepage blocks) ─────────────────────────────────────────────
  // Get a pinned news id to link sections
  const pinnedNews = await prisma.news.findFirst({ where: { isPinned: true } });

  const sectionData = [
    {
      id: '000000000000000000000030',
      name: 'Tin nổi bật',
      newsId: pinnedNews?.id ?? null,
      isActive: true,
      order: 1,
    },
    {
      id: '000000000000000000000031',
      name: 'Giới thiệu dòng họ',
      newsId: null,
      isActive: true,
      order: 2,
    },
    {
      id: '000000000000000000000032',
      name: 'Tin tức & Sự kiện',
      newsId: null,
      isActive: true,
      order: 3,
    },
    {
      id: '000000000000000000000033',
      name: 'Video dòng họ',
      newsId: null,
      isActive: true,
      order: 4,
    },
    {
      id: '000000000000000000000034',
      name: 'Thành tích con cháu',
      newsId: null,
      isActive: true,
      order: 5,
    },
    {
      id: '000000000000000000000035',
      name: 'Gia phả – Cây họ',
      newsId: null,
      isActive: false,
      order: 6,
    },
  ];

  for (const s of sectionData) {
    await prisma.section.upsert({
      where: { id: s.id },
      update: {},
      create: s,
    });
  }
  console.warn(`Seeded ${sectionData.length} sections.`);

  console.warn('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
