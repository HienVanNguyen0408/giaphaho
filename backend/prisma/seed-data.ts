import dotenv from 'dotenv';
dotenv.config({ path: '.env.dev' });
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const firstNames = ['Phùng', 'Phùng', 'Phùng'];
const middleNames = ['Văn', 'Thị', 'Đình', 'Xuân', 'Hữu', 'Ngọc', 'Quang', 'Tiến', 'Minh', 'Đức', 'Gia'];
const lastNames = ['An', 'Bình', 'Cường', 'Dũng', 'Dương', 'Hải', 'Hòa', 'Hoàng', 'Hưng', 'Kiên', 'Lâm', 'Long', 'Nghĩa', 'Phong', 'Phúc', 'Quân', 'Sơn', 'Thái', 'Thành', 'Thiên', 'Thịnh', 'Trung', 'Tuấn', 'Tùng', 'Việt', 'Vinh', 'Anh', 'Châu', 'Chi', 'Diệp', 'Dung', 'Hà', 'Hân', 'Hằng', 'Hiền', 'Hoa', 'Hương', 'Huyền', 'Lan', 'Linh', 'Mai', 'Ngọc', 'Nhi', 'Như', 'Oanh', 'Phương', 'Quyên', 'Quỳnh', 'Tâm', 'Thảo', 'Thủy', 'Tiên', 'Trang', 'Trâm', 'Trúc', 'Tú', 'Uyên', 'Vân', 'Vy', 'Yến'];

function generateName(gender: string) {
  const first = firstNames[0];
  const mid = gender === 'MALE'
    ? middleNames[getRandomInt(0, middleNames.length - 1)]
    : middleNames[getRandomInt(0, middleNames.length - 1)]; // actually 'Thị' is common but let's mix
  const last = lastNames[getRandomInt(0, lastNames.length - 1)];
  return `${first} ${mid} ${last}`;
}

async function main() {
  console.log('Seeding user nvhien...');
  const hashed = await bcrypt.hash('nvhien@123', 12);
  await prisma.user.upsert({
    where: { username: 'nvhien' },
    update: { password: hashed, role: 'SUPER_ADMIN' },
    create: { username: 'nvhien', password: hashed, role: 'SUPER_ADMIN' },
  });
  console.log('Created user: nvhien');

  console.log('Seeding 1500 members across 30 generations...');

  await prisma.member.deleteMany({});

  const totalGenerations = 30;
  const targetMembers = 1500;

  let membersPerGen: number[] = [];

  for (let i = 1; i <= totalGenerations; i++) {
    let count = Math.max(1, Math.floor((i / totalGenerations) * 100)); // Just an arbitrary curve
    membersPerGen.push(count);
  }

  let sum = membersPerGen.reduce((a, b) => a + b, 0);
  let ratio = targetMembers / sum;
  membersPerGen = membersPerGen.map(c => Math.max(1, Math.floor(c * ratio)));
  sum = membersPerGen.reduce((a, b) => a + b, 0);
  membersPerGen[totalGenerations - 1] += targetMembers - sum;

  let currentGenMembers: any[] = [];

  let startYear = 1400;



  // Since Prisma Mongo auto-generates ObjectIds if not provided,
  // We can't link children if we batch insert without knowing their IDs.
  // We will insert generation by generation so we get the IDs back to use as parentId!

  for (let gen = 0; gen < totalGenerations; gen++) {
    const count = membersPerGen[gen];
    const genData: any[] = [];

    for (let i = 0; i < count; i++) {
      const parentId = gen === 0 ? null : currentGenMembers[getRandomInt(0, currentGenMembers.length - 1)].id;
      const gender = getRandomInt(0, 1) === 0 ? 'MALE' : 'FEMALE';
      const birthYear = startYear + gen * 25 + getRandomInt(-5, 5);

      genData.push({
        fullName: gen === 0 ? 'Phùng Sơ Tổ' : generateName(gender),
        gender: gender,
        birthYear: birthYear,
        deathYear: birthYear + getRandomInt(50, 80),
        parentId: parentId || undefined,
        bio: `Thành viên đời thứ ${gen + 1}`,
        achievements: [],
      });
    }

    console.log(`Inserting ${count} members for generation ${gen + 1}...`);
    // createMany doesn't return created records in mongodb sometimes, but wait, it might.
    // Let's insert them one by one or createMany. If createMany doesn't return IDs, we just fetch them.
    // Let's insert one by one using Promise.all to be safe and get IDs.
    const createdGen = await Promise.all(
      genData.map(d => prisma.member.create({ data: d }))
    );

    currentGenMembers = createdGen;
  }

  console.log('Finished seeding 1500 members.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });