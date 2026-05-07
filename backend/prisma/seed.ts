import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface SpouseNode {
  name: string;
  alias?: string;
  birth_day_month?: string;
  death_day_month?: string;
}

interface MemberNode {
  name: string;
  alias?: string;
  birth_day_month?: string;
  death_day_month?: string;
  gender?: string;
  role?: string;
  branch?: string;
  spouses?: SpouseNode[];
  children?: MemberNode[];
}

async function createMember(node: MemberNode, parentId?: string): Promise<string> {
  const gender = node.gender === 'female' ? 'Nữ' : 'Nam';
  const spouseNames = (node.spouses ?? []).map((s) => s.name);

  const bioParts: string[] = [];
  if (node.alias) bioParts.push(`Tên khác: ${node.alias}`);
  if (node.role) bioParts.push(`Vai trò: ${node.role}`);
  if (node.branch) bioParts.push(node.branch);

  const member = await prisma.member.create({
    data: {
      fullName: node.name,
      gender,
      birthDate: node.birth_day_month || null,
      deathDate: node.death_day_month || null,
      spouses: { set: spouseNames },
      parentId: parentId ?? null,
      bio: bioParts.length > 0 ? bioParts.join(' | ') : null,
    },
  });

  for (const child of node.children ?? []) {
    await createMember(child, member.id);
  }

  return member.id;
}

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

  // ── Members – xóa dữ liệu cũ, seed dữ liệu thật ──────────────────────────
  // Phải xóa parentId trước do self-referential relation trong MongoDB
  await prisma.member.updateMany({ where: {}, data: { parentId: null } });
  await prisma.member.deleteMany({});
  console.warn('Cleared existing members.');

  const treeData: MemberNode = {
    name: 'Phùng Nhã Lượng',
    birth_day_month: '',
    death_day_month: '15/7',
    spouses: [
      {
        name: 'Lê Thị Hằng Nhất',
        alias: 'Từ Huệ',
        birth_day_month: '',
        death_day_month: '5/10',
      },
    ],
    children: [
      {
        name: 'Phùng Mẫn Huệ',
        alias: 'Huệ Mẫn',
        birth_day_month: '',
        death_day_month: '15/3',
        spouses: [
          {
            name: 'Nguyễn Thị Ý Đức',
            birth_day_month: '',
            death_day_month: '5/4',
          },
        ],
        children: [
          {
            name: 'Phùng Phúc Điền',
            birth_day_month: '',
            death_day_month: '5/5',
            spouses: [
              {
                name: 'Hoàng Trinh Tuyết',
                birth_day_month: '',
                death_day_month: '19/6',
              },
            ],
            children: [
              {
                name: 'Phùng Phúc Ninh',
                birth_day_month: '',
                death_day_month: '29/4',
                spouses: [
                  {
                    name: 'Nguyễn Từ Huy',
                    birth_day_month: '',
                    death_day_month: '27/11',
                  },
                ],
                children: [
                  {
                    name: 'Phùng Chân Lương',
                    birth_day_month: '',
                    death_day_month: '',
                  },
                  {
                    name: 'Phùng Phúc Thiện',
                    birth_day_month: '',
                    death_day_month: '',
                  },
                  {
                    name: 'Phùng Phúc Trung',
                    birth_day_month: '',
                    death_day_month: '07/3',
                    spouses: [
                      {
                        name: 'Lê Thục Chất',
                        birth_day_month: '',
                        death_day_month: '28/08',
                      },
                    ],
                    children: [
                      {
                        name: 'Phùng Thị Già',
                        birth_day_month: '',
                        death_day_month: '',
                        gender: 'female',
                      },
                      {
                        name: 'Phùng Phúc Toàn',
                        birth_day_month: '',
                        death_day_month: '11/6',
                        spouses: [
                          {
                            name: 'Vũ Từ Quang',
                            birth_day_month: '',
                            death_day_month: '14/3',
                          },
                        ],
                        children: [
                          {
                            name: 'Phùng Phúc Diên',
                            birth_day_month: '',
                            death_day_month: '16/4',
                            spouses: [
                              {
                                name: 'Hà Từ Ân',
                                birth_day_month: '',
                              },
                            ],
                            children: [
                              {
                                name: 'Phùng Phúc Thọ',
                                birth_day_month: '',
                                death_day_month: '',
                              },
                              {
                                name: 'Phùng Hà Diễn',
                                birth_day_month: '',
                                death_day_month: '',
                              },
                              {
                                name: 'Phùng Đắc Ý',
                                birth_day_month: '',
                                death_day_month: '23/1',
                                spouses: [
                                  {
                                    name: 'P. Phương Xuân',
                                    birth_day_month: '',
                                    death_day_month: '',
                                  },
                                  {
                                    name: 'T. Khoan Cung',
                                    birth_day_month: '',
                                    death_day_month: '',
                                  },
                                ],
                                children: [
                                  {
                                    name: 'Phùng Tuấn',
                                    birth_day_month: '',
                                    death_day_month: '29/4',
                                    spouses: [
                                      {
                                        name: 'Đỗ Trinh Hậu',
                                        birth_day_month: '',
                                        death_day_month: '5/11',
                                      },
                                    ],
                                    children: [
                                      {
                                        name: 'Phùng Duy Chính',
                                        birth_day_month: '',
                                        death_day_month: '3/5',
                                        spouses: [
                                          {
                                            name: 'Ng. Cần Mẫn',
                                            birth_day_month: '',
                                            death_day_month: '',
                                          },
                                        ],
                                        children: [
                                          {
                                            name: 'Phùng Nhận',
                                            role: 'chi trưởng',
                                            birth_day_month: '',
                                            death_day_month: '',
                                          },
                                          {
                                            name: 'Phùng Huy Vĩ',
                                            birth_day_month: '',
                                            death_day_month: '',
                                          },
                                          {
                                            name: 'Phùng Ba',
                                            birth_day_month: '',
                                            death_day_month: '',
                                          },
                                          {
                                            name: 'Phùng Khanh',
                                            birth_day_month: '',
                                            death_day_month: '',
                                          },
                                        ],
                                      },
                                      {
                                        name: 'Phùng Sương Tiết',
                                        birth_day_month: '',
                                        death_day_month: '',
                                      },
                                    ],
                                  },
                                  {
                                    name: 'Phùng Huy Lan',
                                    birth_day_month: '',
                                    death_day_month: '',
                                  },
                                ],
                              },
                              {
                                name: 'Phùng Thị Mùi',
                                birth_day_month: '',
                                death_day_month: '',
                                gender: 'female',
                              },
                              {
                                name: 'Phùng Thị Tam',
                                birth_day_month: '',
                                death_day_month: '',
                                gender: 'female',
                              },
                            ],
                          },
                          {
                            name: 'Phùng Phúc Chính',
                            birth_day_month: '',
                            death_day_month: '',
                            spouses: [
                              {
                                name: 'Lê Từ Ý',
                                birth_day_month: '',
                                death_day_month: '',
                              },
                            ],
                          },
                          {
                            name: 'Phùng Phúc Hưng',
                            birth_day_month: '',
                            death_day_month: '',
                            spouses: [
                              {
                                name: 'Phạm Từ Khang',
                                birth_day_month: '',
                                death_day_month: '',
                              },
                            ],
                          },
                        ],
                      },
                      {
                        name: 'Phùng Đắc Áng',
                        birth_day_month: '',
                        death_day_month: '',
                      },
                      {
                        name: 'Phùng Thị Quyền',
                        birth_day_month: '',
                        death_day_month: '',
                        gender: 'female',
                      },
                      {
                        name: 'Phùng Đội Tự',
                        birth_day_month: '',
                        death_day_month: '',
                      },
                    ],
                  },
                  {
                    name: 'Phùng Thuần Trí',
                    birth_day_month: '',
                    death_day_month: '',
                  },
                  {
                    name: 'Phùng An Công',
                    birth_day_month: '',
                    death_day_month: '',
                  },
                  {
                    name: 'Phùng Đức Tuấn',
                    alias: 'Tích Phúc',
                    birth_day_month: '',
                    death_day_month: '19/06',
                    spouses: [
                      {
                        name: 'Nguyễn Thục Mỹ',
                        birth_day_month: '',
                        death_day_month: '',
                      },
                      {
                        name: 'Ng. Uyển Khanh',
                        birth_day_month: '',
                        death_day_month: '',
                      },
                    ],
                    children: [
                      {
                        name: 'Phùng Huân Thức',
                        birth_day_month: '',
                        death_day_month: '12/3',
                        spouses: [
                          {
                            name: 'Ng. Trinh Khiết',
                            birth_day_month: '',
                            death_day_month: '',
                          },
                        ],
                        children: [
                          {
                            name: 'Phùng Phúc Ân',
                            birth_day_month: '',
                            death_day_month: '',
                            spouses: [
                              {
                                name: 'Ng. Từ Đức',
                                birth_day_month: '',
                                death_day_month: '',
                              },
                            ],
                            children: [
                              {
                                name: 'Phùng Đức Thuận',
                                birth_day_month: '',
                                death_day_month: '',
                                spouses: [
                                  {
                                    name: 'Trần Từ Thực',
                                    birth_day_month: '',
                                    death_day_month: '',
                                  },
                                ],
                                children: [
                                  {
                                    name: 'Phùng Đức Thi',
                                    birth_day_month: '',
                                    death_day_month: '',
                                    spouses: [
                                      {
                                        name: 'Phạm Từ Triết',
                                        birth_day_month: '',
                                        death_day_month: '',
                                      },
                                      {
                                        name: 'Phạm Từ Khiết',
                                        birth_day_month: '',
                                        death_day_month: '',
                                      },
                                    ],
                                    children: [
                                      {
                                        name: 'Phùng Quang Đạt',
                                        birth_day_month: '',
                                        death_day_month: '',
                                        spouses: [
                                          {
                                            name: 'Ng. Từ Thanh',
                                            birth_day_month: '',
                                            death_day_month: '',
                                          },
                                          {
                                            name: 'Trần Từ Vân',
                                            birth_day_month: '',
                                            death_day_month: '',
                                          },
                                        ],
                                        children: [
                                          {
                                            name: 'Phùng Thanh Quý',
                                            alias: 'Viễn Toan',
                                            birth_day_month: '',
                                            death_day_month: '',
                                            spouses: [
                                              {
                                                name: 'Phạm Huy Nhu',
                                                birth_day_month: '',
                                                death_day_month: '',
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        name: 'Phùng Đức Khoan',
                        birth_day_month: '',
                        death_day_month: '',
                      },
                      {
                        name: 'Phùng Hy Điền',
                        birth_day_month: '',
                        death_day_month: '',
                        spouses: [
                          {
                            name: 'Cao Từ Thịnh',
                            birth_day_month: '',
                            death_day_month: '',
                          },
                        ],
                      },
                    ],
                  },
                  {
                    name: 'Phùng Thị Mai',
                    birth_day_month: '',
                    death_day_month: '',
                    gender: 'female',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  const rootId = await createMember(treeData);
  console.warn('Seeded real family tree. Root member id:', rootId);

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
  const newsData: Array<{
    slug: string;
    title: string;
    content: string;
    isPinned: boolean;
    thumbnail?: string;
  }> = [
    {
      slug: 'gio-to-dong-ho-2026',
      title: 'Giỗ tổ dòng họ Phùng Bát Tràng 2026',
      content: `<h2>Thông báo Giỗ tổ dòng họ năm 2026</h2>
<p>Ngày <strong>15 tháng 3 âm lịch</strong> năm 2026, toàn thể con cháu họ Phùng ở Bát Tràng, Hà Nội và các tỉnh thành lân cận sẽ cùng trở về nhà thờ họ để tham dự lễ Giỗ tổ thường niên. Đây là dịp quan trọng để tưởng nhớ công đức tiền nhân, ôn lại gia phong và gắn kết các thế hệ con cháu.</p>
<p>Năm nay, ban tổ chức thống nhất chuẩn bị không gian hành lễ, khu vực đón tiếp và khu trưng bày sản phẩm gốm gia truyền theo hướng trang trọng, ấm cúng nhưng gọn gàng. Đại diện các chi được đề nghị rà soát danh sách người tham dự trước ngày làm lễ để việc đón tiếp, sắp xếp cỗ bàn và chuẩn bị lễ vật được chu đáo hơn.</p>
<h3>Chương trình</h3>
<ul>
  <li>07:00 - Đón tiếp con cháu tại cổng nhà thờ họ.</li>
  <li>08:00 - Cử hành nghi thức dâng hương, đọc chúc văn.</li>
  <li>09:30 - Báo cáo công tác dòng họ trong năm qua.</li>
  <li>10:30 - Gặp mặt, thăm hỏi và chụp ảnh lưu niệm.</li>
  <li>11:30 - Dùng cơm thân mật.</li>
</ul>`,
      isPinned: true,
    },
    {
      slug: 'hop-mat-chi-truong-2026',
      title: 'Họp mặt chi trưởng các dòng họ năm 2026',
      content: `<h2>Họp mặt chi trưởng thường niên</h2>
<p>Buổi họp mặt thường niên giữa các chi trưởng sẽ diễn ra vào ngày <strong>20 tháng 1 âm lịch</strong> tại nhà thờ họ Phùng.</p>`,
      isPinned: false,
    },
    {
      slug: 'tu-suong-bieu-duong-2025',
      title: 'Tuyên dương con cháu học giỏi, đỗ đại học năm 2025',
      content: `<h2>Tuyên dương học sinh, sinh viên xuất sắc</h2>
<p>Nhân dịp đầu năm mới, Ban liên lạc dòng họ Phùng Bát Tràng trân trọng biểu dương <strong>23 con cháu</strong> đạt thành tích học tập xuất sắc trong năm học 2024 - 2025.</p>`,
      isPinned: true,
    },
    {
      slug: 'bao-ton-nghe-gom-bat-trang',
      title: 'Dự án bảo tồn nghề gốm truyền thống Bát Tràng của dòng họ Phùng',
      content: `<h2>Bảo tồn di sản gốm Phùng Bát Tràng</h2>
<p>Dòng họ Phùng chính thức khởi động dự án <strong>"Lưu giữ hồn gốm Bát Tràng"</strong> nhằm hệ thống hóa, bảo tồn và truyền dạy những kỹ thuật làm gốm cổ truyền đã được tích lũy qua nhiều thế hệ.</p>`,
      isPinned: false,
    },
    {
      slug: 'quy-khuyen-hoc-2026',
      title: 'Thông báo quỹ khuyến học dòng họ Phùng năm 2026',
      content: `<h2>Quỹ Khuyến học Phùng Bát Tràng</h2>
<p>Quỹ Khuyến học dòng họ Phùng Bát Tràng năm 2026 đã nhận được sự ủng hộ tích cực từ con cháu trong và ngoài nước, với tổng số tiền cam kết tính đến đầu tháng 5 đạt <strong>150 triệu đồng</strong>.</p>`,
      isPinned: false,
    },
  ];

  for (const n of newsData) {
    await prisma.news.upsert({
      where: { slug: n.slug },
      update: {
        title: n.title,
        content: n.content,
        thumbnail: n.thumbnail ?? null,
        isPinned: n.isPinned,
      },
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

  // ── Sections ───────────────────────────────────────────────────────────────
  const pinnedNews = await prisma.news.findFirst({ where: { isPinned: true } });

  const sectionData = [
    { id: '000000000000000000000030', name: 'Tin nổi bật', newsId: pinnedNews?.id ?? null, isActive: true, order: 1 },
    { id: '000000000000000000000031', name: 'Giới thiệu dòng họ', newsId: null, isActive: true, order: 2 },
    { id: '000000000000000000000032', name: 'Tin tức & Sự kiện', newsId: null, isActive: true, order: 3 },
    { id: '000000000000000000000033', name: 'Video dòng họ', newsId: null, isActive: true, order: 4 },
    { id: '000000000000000000000034', name: 'Thành tích con cháu', newsId: null, isActive: true, order: 5 },
    { id: '000000000000000000000035', name: 'Gia phả – Cây họ', newsId: null, isActive: false, order: 6 },
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
