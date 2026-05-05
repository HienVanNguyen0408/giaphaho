import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const FIRST_NAMES = ["Văn", "Thị", "Quang", "Minh", "Hữu", "Đức", "Trọng", "Tiến", "Anh", "Tuấn", "Hoàng", "Ngọc", "Mai", "Lan", "Hương", "Hà", "Phương", "Thu", "Thanh", "Bình", "Hải", "Sơn", "Long", "Đạt", "Thắng"];
const LAST_NAMES = ["Phùng"];

function generateName(gender: string) {
  const last = LAST_NAMES[0];
  let middle = "";
  if (gender === "Nam") {
    middle = ["Văn", "Đức", "Quang", "Minh", "Hữu", "Trọng", "Tiến", "Tuấn", "Hoàng"][randomInt(0, 8)];
  } else {
    middle = ["Thị", "Ngọc", "Mai", "Thu", "Thanh", "Bích"][randomInt(0, 5)];
  }
  const first = FIRST_NAMES[randomInt(0, FIRST_NAMES.length - 1)];
  return `${last} ${middle} ${first}`;
}

async function main() {
  console.log('Clearing old members...');
  await prisma.member.deleteMany({});
  
  console.log('Generating 1500 members across 30 generations...');
  
  const TOTAL_MEMBERS = 1500;
  const DECEASED_COUNT = 1000;
  const LIVING_COUNT = 500;
  const GENERATIONS = 30;

  // Distribute members across 30 generations
  // Gen 1: 1 member
  // Next 29 gens: sum = 1499.
  // We'll use a slightly expanding distribution or just uniform
  
  let generationCounts = new Array(GENERATIONS).fill(0);
  generationCounts[0] = 1;
  let remaining = TOTAL_MEMBERS - 1;
  
  for (let i = 1; i < GENERATIONS; i++) {
    // Basic expanding model
    generationCounts[i] = Math.floor(remaining / (GENERATIONS - i));
    remaining -= generationCounts[i];
  }
  // Any remainder goes to last gen
  generationCounts[GENERATIONS - 1] += remaining;

  // We have exactly 1000 deceased. We'll make the first 1000 generated people deceased.
  let membersGenerated = 0;

  // Store IDs of previous generation to pick parents
  let previousGenIds: string[] = [];

  let currentYear = 1400; // Base year

  for (let g = 0; g < GENERATIONS; g++) {
    const count = generationCounts[g];
    console.log(`Generation ${g + 1}: ${count} members`);
    
    let currentGenIds: string[] = [];
    currentYear += 25; // 25 years per gen

    for (let i = 0; i < count; i++) {
      const isDeceased = membersGenerated < DECEASED_COUNT;
      const gender = Math.random() > 0.5 ? 'Nam' : 'Nữ';
      
      let parentId = null;
      if (previousGenIds.length > 0) {
        parentId = previousGenIds[randomInt(0, previousGenIds.length - 1)];
      }

      const birthYear = currentYear + randomInt(-5, 5);
      const deathYear = isDeceased ? birthYear + randomInt(40, 85) : null;

      const member = await prisma.member.create({
        data: {
          fullName: g === 0 ? "Phùng Tổ (Thủy Tổ)" : generateName(gender),
          gender,
          birthYear,
          deathYear,
          parentId,
          bio: g === 0 ? "Thủy tổ dòng họ Phùng Bát Tràng." : null
        }
      });
      
      currentGenIds.push(member.id);
      membersGenerated++;
    }
    
    previousGenIds = currentGenIds;
  }
  
  console.log(`Successfully generated ${membersGenerated} members.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });