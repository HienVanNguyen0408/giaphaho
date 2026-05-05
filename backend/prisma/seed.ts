import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.warn('Seeding database...');

  // SUPER_ADMIN
  const hashed = await bcrypt.hash('changeme123', 12);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: hashed, role: 'SUPER_ADMIN' },
  });
  console.warn('Created admin:', admin.username);

  // Root member (clan founder)
  const founder = await prisma.member.upsert({
    where: { id: '000000000000000000000001' },
    update: {},
    create: {
      id: '000000000000000000000001',
      fullName: 'Phùng Tổ',
      birthYear: 1800,
      gender: 'male',
      bio: 'Thủy tổ dòng họ Phùng Bát Tràng.',
      achievements: ['Khai sáng dòng họ Phùng tại Bát Tràng'],
    },
  });
  console.warn('Created founder:', founder.fullName);

  // Footer config
  await prisma.footerConfig.upsert({
    where: { id: '000000000000000000000010' },
    update: {},
    create: {
      id: '000000000000000000000010',
      contact: 'Email: giapha@phungbattrang.vn | ĐT: 0123 456 789',
      description: 'Website lưu giữ và phát huy truyền thống dòng họ Phùng Bát Tràng.',
      copyright: '© 2026 Dòng họ Phùng Bát Tràng. All rights reserved.',
    },
  });

  // Sample news
  await prisma.news.upsert({
    where: { slug: 'gio-to-dong-ho-2026' },
    update: {},
    create: {
      title: 'Giỗ tổ dòng họ Phùng Bát Tràng 2026',
      slug: 'gio-to-dong-ho-2026',
      content: '<p>Ngày 15 tháng 3 âm lịch, toàn thể con cháu họ Phùng tập trung về Bát Tràng...</p>',
      isPinned: true,
    },
  });

  await prisma.news.upsert({
    where: { slug: 'hop-mat-chi-truong-2026' },
    update: {},
    create: {
      title: 'Họp mặt chi trưởng các dòng họ năm 2026',
      slug: 'hop-mat-chi-truong-2026',
      content: '<p>Buổi họp mặt thường niên giữa các chi trưởng...</p>',
      isPinned: false,
    },
  });

  // Sample videos
  await prisma.video.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'Lễ giỗ tổ dòng họ Phùng 2025',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        order: 1,
      },
      {
        title: 'Bát Tràng – Làng nghề gốm truyền thống',
        youtubeUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
        thumbnailUrl: 'https://img.youtube.com/vi/ScMzIvxBSi4/hqdefault.jpg',
        order: 2,
      },
    ],
  });

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
