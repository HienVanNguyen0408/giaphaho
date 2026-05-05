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
<p>Lễ vật dâng cúng tổ tiên khuyến khích mang đậm dấu ấn truyền thống của dòng họ, đặc biệt là các sản phẩm gốm thủ công do chính con cháu thực hiện. Bên cạnh đó, mỗi gia đình có thể chuẩn bị thêm hương hoa, trà, quả và những vật phẩm tưởng niệm phù hợp với nếp nhà.</p>
<h3>Chương trình</h3>
<ul>
  <li>07:00 - Đón tiếp con cháu tại cổng nhà thờ họ, ổn định vị trí và kiểm tra danh sách đại diện các chi.</li>
  <li>08:00 - Cử hành nghi thức dâng hương, đọc chúc văn và tưởng niệm các bậc tiền nhân.</li>
  <li>09:30 - Báo cáo ngắn về công tác dòng họ trong năm qua, tình hình gia phả và các hoạt động cộng đồng.</li>
  <li>10:30 - Gặp mặt, thăm hỏi, giao lưu giữa các gia đình và chụp ảnh lưu niệm toàn họ.</li>
  <li>11:30 - Dùng cơm thân mật, giao lưu văn nghệ và chia sẻ kế hoạch hoạt động năm tới.</li>
</ul>
<p>Ban liên lạc cũng đề nghị mỗi chi cử ít nhất một người trẻ tham gia hỗ trợ khâu hậu cần, ghi hình và cập nhật thông tin lên website gia phả. Việc này giúp vừa duy trì truyền thống, vừa tạo cơ hội để thế hệ sau hiểu hơn về cội nguồn của mình.</p>
<blockquote>Giỗ tổ không chỉ là một nghi lễ, mà còn là ngày để con cháu nhắc nhau sống đúng gia phong, giữ lấy nề nếp và tình thân trong dòng họ.</blockquote>
<p>Mọi đóng góp về công sức, kinh phí hoặc hiện vật phục vụ buổi lễ xin gửi về ban tổ chức trước một tuần để tổng hợp. Những trường hợp ở xa không thể về dự trực tiếp có thể gửi lời tri ân để ban tổ chức đọc trong phần tưởng niệm chung của buổi lễ.</p>`,
      isPinned: true,
    },
    {
      slug: 'hop-mat-chi-truong-2026',
      title: 'Họp mặt chi trưởng các dòng họ năm 2026',
      content: `<h2>Họp mặt chi trưởng thường niên</h2>
<p>Buổi họp mặt thường niên giữa các chi trưởng sẽ diễn ra vào ngày <strong>20 tháng 1 âm lịch</strong> tại nhà thờ họ Phùng. Đây là cuộc họp mở đầu năm mới nhằm thống nhất định hướng hoạt động, phân công đầu việc theo từng chi và giải quyết các nội dung liên quan đến gia phả, khuyến học, từ đường và công tác đối ngoại.</p>
<p>Trong năm vừa qua, các chi đã phối hợp khá tốt trong việc cập nhật thông tin nhân khẩu, tổ chức giỗ họ và hỗ trợ các gia đình khó khăn. Tuy vậy, việc chuẩn hóa dữ liệu gia phả điện tử, lưu trữ ảnh tư liệu cũ và đồng bộ đầu mối liên lạc giữa các chi vẫn còn chậm. Cuộc họp năm nay sẽ dành thời lượng riêng để xử lý các điểm nghẽn này.</p>
<h3>Nội dung thảo luận chính</h3>
<ul>
  <li>Tổng kết hoạt động năm 2025, đánh giá các chương trình đã hoàn thành và các hạng mục còn tồn đọng.</li>
  <li>Thống nhất lịch giỗ tổ, họp họ, khuyến học và các sự kiện cộng đồng trong năm 2026.</li>
  <li>Rà soát quỹ họ, nguồn thu chi thường xuyên và phương án công khai minh bạch theo từng quý.</li>
  <li>Phân công đầu mối cập nhật dữ liệu gia phả trực tuyến, hình ảnh tư liệu và thông tin con cháu mới.</li>
  <li>Trao đổi phương án tu sửa nhỏ một số hạng mục trong khuôn viên nhà thờ họ trước mùa mưa.</li>
</ul>
<p>Sau phần làm việc chung, đại diện từng chi sẽ có thời gian phát biểu ngắn về đặc thù của chi mình, những khó khăn đang gặp phải và đề xuất hỗ trợ. Ban liên lạc khuyến khích các ý kiến tập trung vào giải pháp cụ thể để có thể triển khai ngay trong quý II năm 2026.</p>
<p>Biên bản cuộc họp sẽ được tổng hợp đầy đủ, lưu trữ tại nhà thờ họ và đăng tải bản rút gọn trên website để con cháu tiện theo dõi. Những nội dung cần xin ý kiến rộng hơn sẽ được thông báo riêng sau cuộc họp.</p>`,
      isPinned: false,
    },
    {
      slug: 'tu-suong-bieu-duong-2025',
      title: 'Tuyên dương con cháu học giỏi, đỗ đại học năm 2025',
      content: `<h2>Tuyên dương học sinh, sinh viên xuất sắc</h2>
<p>Nhân dịp đầu năm mới, Ban liên lạc dòng họ Phùng Bát Tràng trân trọng biểu dương <strong>23 con cháu</strong> đạt thành tích học tập xuất sắc trong năm học 2024 - 2025. Đây là hoạt động thường niên nhằm khích lệ tinh thần hiếu học, nuôi dưỡng ý chí vươn lên và giữ gìn truyền thống trọng học của dòng họ.</p>
<p>Trong danh sách được tuyên dương năm nay có nhiều thành tích nổi bật: học sinh đạt giải cấp thành phố, cấp quốc gia; sinh viên tốt nghiệp loại giỏi; các em trúng tuyển vào những trường đại học có yêu cầu đầu vào cao. Đặc biệt, có 5 em đỗ vào các trường như Đại học Bách khoa Hà Nội, Đại học Y Hà Nội, Học viện Ngoại giao, Đại học Kinh tế Quốc dân và Học viện Tài chính.</p>
<h3>Một số tiêu chí xét tuyên dương</h3>
<ul>
  <li>Học sinh đạt học lực giỏi liên tục trong năm học hoặc có giải thưởng học thuật chính thức.</li>
  <li>Thí sinh trúng tuyển đại học với kết quả nổi bật hoặc đỗ vào chương trình chất lượng cao.</li>
  <li>Sinh viên có thành tích nghiên cứu khoa học, hoạt động cộng đồng hoặc vượt khó học tốt.</li>
</ul>
<p>Bên cạnh phần vinh danh, chương trình còn dành thời gian để các em giao lưu, chia sẻ phương pháp học tập và định hướng nghề nghiệp cho lớp sau. Ban khuyến học đánh giá đây là điểm rất cần thiết vì giúp thành tích cá nhân trở thành động lực chung cho cả dòng họ.</p>
<blockquote>Khuyến học không dừng ở phần thưởng, mà là cách dòng họ đầu tư lâu dài cho trí tuệ, nhân cách và tương lai của con cháu.</blockquote>
<p>Danh sách đầy đủ các em được tuyên dương và mức học bổng tương ứng sẽ được niêm yết tại nhà thờ họ, đồng thời cập nhật trên website sau khi hoàn tất xác minh hồ sơ. Những trường hợp chưa kịp nộp minh chứng có thể bổ sung trong đợt xét bổ sung của quý I năm 2026.</p>`,
      isPinned: true,
    },
    {
      slug: 'bao-ton-nghe-gom-bat-trang',
      title: 'Dự án bảo tồn nghề gốm truyền thống Bát Tràng của dòng họ Phùng',
      content: `<h2>Bảo tồn di sản gốm Phùng Bát Tràng</h2>
<p>Dòng họ Phùng chính thức khởi động dự án <strong>"Lưu giữ hồn gốm Bát Tràng"</strong> nhằm hệ thống hóa, bảo tồn và truyền dạy những kỹ thuật làm gốm cổ truyền đã được tích lũy qua nhiều thế hệ. Đây là một trong những chương trình trọng điểm của dòng họ trong giai đoạn 2026 - 2028.</p>
<p>Dự án không chỉ hướng đến việc giữ lại các công thức, kỹ thuật và mẫu hoa văn cổ, mà còn tập trung xây dựng tư liệu số về lịch sử nghề của từng nhánh gia đình. Nhiều tư liệu quý như sổ chép lò nung, ảnh sản phẩm cũ, mẫu men đặc biệt và lời kể của các nghệ nhân cao tuổi sẽ được sưu tầm, ghi chép và lưu trữ tập trung.</p>
<h3>Các hạng mục triển khai</h3>
<ol>
  <li>Lập hồ sơ kỹ thuật cho các dòng sản phẩm gốm truyền thống của gia đình và từng nghệ nhân tiêu biểu.</li>
  <li>Tổ chức lớp truyền nghề cuối tuần cho thanh thiếu niên trong họ với nội dung từ tạo dáng, tráng men đến nung lò.</li>
  <li>Xây dựng góc trưng bày nhỏ tại nhà thờ họ để giới thiệu lịch sử làng nghề và các hiện vật gắn với dòng họ.</li>
  <li>Ghi hình và số hóa lời kể của các bậc cao niên để làm tư liệu giáo dục cho thế hệ sau.</li>
</ol>
<p>Ban dự án đang kêu gọi con cháu đang làm trong lĩnh vực thiết kế, truyền thông, lưu trữ và công nghệ cùng tham gia hỗ trợ. Sự phối hợp giữa người giữ nghề và người làm công tác số hóa sẽ giúp dự án có giá trị lâu dài, không dừng ở hoạt động phong trào ngắn hạn.</p>
<p>Trong quý II năm 2026, dự án sẽ bắt đầu bằng đợt khảo sát hiện vật và phỏng vấn các nghệ nhân cao tuổi. Kết quả bước đầu sẽ được công bố trong buổi họp họ giữa năm để lấy ý kiến hoàn thiện trước khi mở rộng ra toàn bộ các chi.</p>`,
      isPinned: false,
    },
    {
      slug: 'quy-khuyen-hoc-2026',
      title: 'Thông báo quỹ khuyến học dòng họ Phùng năm 2026',
      content: `<h2>Quỹ Khuyến học Phùng Bát Tràng</h2>
<p>Quỹ Khuyến học dòng họ Phùng Bát Tràng năm 2026 đã nhận được sự ủng hộ tích cực từ con cháu trong và ngoài nước, với tổng số tiền cam kết tính đến đầu tháng 5 đạt <strong>150 triệu đồng</strong>. Đây là nguồn lực quan trọng để tiếp tục duy trì hoạt động học bổng, hỗ trợ học tập và khuyến khích tinh thần hiếu học trong toàn dòng họ.</p>
<p>Theo kế hoạch năm nay, quỹ sẽ ưu tiên trao học bổng cho khoảng 30 học sinh, sinh viên thuộc các diện: vượt khó học tốt, đạt thành tích cao, đỗ đại học, hoặc có thành tích nghiên cứu và hoạt động cộng đồng nổi bật. Ngoài hỗ trợ tài chính, ban khuyến học cũng đang xây dựng mạng lưới cố vấn nghề nghiệp là những anh chị đi trước trong dòng họ.</p>
<h3>Nguyên tắc sử dụng quỹ</h3>
<ul>
  <li>Công khai nguồn đóng góp, danh sách tài trợ và kết quả phân bổ trên từng đợt xét học bổng.</li>
  <li>Ưu tiên đúng đối tượng, đúng tiêu chí, có xác nhận từ gia đình và đại diện chi họ.</li>
  <li>Kết hợp hỗ trợ tài chính với định hướng học tập, tư vấn tuyển sinh và kết nối việc làm.</li>
</ul>
<p>Hồ sơ xét học bổng đợt 1 sẽ được tiếp nhận từ tháng 6 đến hết tháng 7 năm 2026. Các gia đình cần chuẩn bị bản sao kết quả học tập, giấy xác nhận hoàn cảnh nếu có và đơn đề nghị theo mẫu của ban khuyến học. Hồ sơ có thể nộp trực tiếp cho đại diện chi hoặc gửi bản điện tử qua đầu mối phụ trách website.</p>
<blockquote>Mỗi khoản đóng góp cho quỹ, dù lớn hay nhỏ, đều là một cách gìn giữ truyền thống hiếu học và mở thêm cơ hội cho thế hệ sau.</blockquote>
<p>Ban vận động mong tiếp tục nhận được sự chung tay của con cháu để quỹ ngày càng ổn định, bền vững và có khả năng hỗ trợ dài hạn hơn. Báo cáo thu chi chi tiết của quỹ sẽ được công bố trong kỳ họp họ gần nhất.</p>`,
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
