import dotenv from 'dotenv';
dotenv.config({ path: '.env.dev' });
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface FlatMember {
  _ref: string;
  fullName: string;
  gender: string | null;
  parentRef: string | null;
  birthYear: number | null;
  birthDate: string | null;
  deathYear: number | null;
  deathDate: string | null;
  bio: string | null;
  spouses: string[];
}

interface DataFile {
  _meta: { generationBase?: number; chi?: string };
  members: FlatMember[];
}

async function seedChiNhanh(dataFilePath: string, rootName: string) {
  const raw = fs.readFileSync(dataFilePath, 'utf-8');
  const data: DataFile = JSON.parse(raw);
  const members = data.members;
  const generationBase = data._meta?.generationBase ?? 11;

  console.warn(`\n── ${data._meta.chi ?? rootName} ──`);

  // Tìm chi trưởng đã có trong DB
  const rootInDb = await prisma.member.findFirst({
    where: { fullName: rootName },
    select: { id: true, generation: true },
  });

  if (!rootInDb) {
    throw new Error(
      `Không tìm thấy "${rootName}" trong database. Hãy chạy seed gốc trước.`,
    );
  }
  console.warn(`  Tìm thấy "${rootName}" → id: ${rootInDb.id}`);

  // Map _ref → db ObjectId
  const refToId = new Map<string, string>();
  const refToGen = new Map<string, number>();

  const rootMember = members.find((m) => m.parentRef === null);
  if (!rootMember) throw new Error('Không tìm thấy root member trong file');

  refToId.set(rootMember._ref, rootInDb.id);
  refToGen.set(rootMember._ref, generationBase);

  // Cập nhật thông tin chi trưởng nếu file có thêm dữ liệu (birthDate, spouses...)
  const rootUpdates: Record<string, unknown> = {};
  if (rootMember.birthDate) rootUpdates.birthDate = rootMember.birthDate;
  if (rootMember.birthYear) rootUpdates.birthYear = rootMember.birthYear;
  if (rootMember.deathDate) rootUpdates.deathDate = rootMember.deathDate;
  if (rootMember.deathYear) rootUpdates.deathYear = rootMember.deathYear;
  if (rootMember.bio) rootUpdates.bio = rootMember.bio;
  if (rootMember.spouses?.length) rootUpdates.spouses = { set: rootMember.spouses };
  if (Object.keys(rootUpdates).length > 0) {
    await prisma.member.update({ where: { id: rootInDb.id }, data: rootUpdates });
    console.warn(`  Cập nhật thông tin "${rootName}"`);
  }

  let created = 0;
  let skipped = 0;

  for (const m of members) {
    if (m.parentRef === null) continue; // bỏ qua root

    const parentDbId = refToId.get(m.parentRef);
    if (!parentDbId) {
      console.warn(`  ⚠ Bỏ qua "${m.fullName}": parentRef "${m.parentRef}" chưa được xử lý`);
      skipped++;
      continue;
    }

    const parentGen = refToGen.get(m.parentRef) ?? generationBase;
    const gen = parentGen + 1;

    const newMember = await prisma.member.create({
      data: {
        fullName: m.fullName,
        gender: m.gender ?? null,
        birthYear: m.birthYear ?? null,
        birthDate: m.birthDate ?? null,
        deathYear: m.deathYear ?? null,
        deathDate: m.deathDate ?? null,
        bio: m.bio ?? null,
        spouses: { set: m.spouses ?? [] },
        parentId: parentDbId,
        generation: gen,
      },
    });

    refToId.set(m._ref, newMember.id);
    refToGen.set(m._ref, gen);
    created++;
  }

  console.warn(`  ✓ Đã thêm ${created} thành viên mới (bỏ qua: ${skipped})`);
  return created;
}

async function main() {
  const base = path.resolve(__dirname, '../../task-prompts/giapha');

  const total1 = await seedChiNhanh(
    path.join(base, 'chi_nhanh_1/data.json'),
    'Phùng Nhận',
  );

  const total2 = await seedChiNhanh(
    path.join(base, 'chinhanh_2/data.json'),
    'Phùng Huy Vĩ',
  );

  console.warn(`\n✅ Seed hoàn tất: ${total1 + total2} thành viên mới đã được thêm vào database.`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
