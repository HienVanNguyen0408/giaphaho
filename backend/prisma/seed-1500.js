require('dotenv/config');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const FIRST_NAMES = ["Văn", "Thị", "Quang", "Minh", "Hữu", "Đức", "Trọng", "Tiến", "Anh", "Tuấn", "Hoàng", "Ngọc", "Mai", "Lan", "Hương", "Hà", "Phương", "Thu", "Thanh", "Bình", "Hải", "Sơn", "Long", "Đạt", "Thắng"];
const LAST_NAMES = ["Phùng"];

function generateName(gender) {
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
  try {
    await prisma.$runCommandRaw({ drop: 'Member' });
  } catch (e) {
    console.log('Collection might not exist yet, ignoring drop error.');
  }
  
  console.log('Generating 1500 members across 30 generations...');
  
  const TOTAL_MEMBERS = 1500;
  const DECEASED_COUNT = 1000;
  const LIVING_COUNT = 500;
  const GENERATIONS = 30;

  let generationCounts = new Array(GENERATIONS).fill(0);
  generationCounts[0] = 1;
  let remaining = TOTAL_MEMBERS - 1;
  
  for (let i = 1; i < GENERATIONS; i++) {
    generationCounts[i] = Math.floor(remaining / (GENERATIONS - i));
    remaining -= generationCounts[i];
  }
  generationCounts[GENERATIONS - 1] += remaining;

  let membersGenerated = 0;
  let previousGenIds = [];
  let currentYear = 1400; // Base year

  for (let g = 0; g < GENERATIONS; g++) {
    const count = generationCounts[g];
    console.log(`Generation ${g + 1}: ${count} members`);
    
    let currentGenIds = [];
    currentYear += 25; 

    // Batch insert might be faster, but let's do parallel creates or chunking
    const tasks = [];
    for (let i = 0; i < count; i++) {
      const isDeceased = membersGenerated < DECEASED_COUNT;
      const gender = Math.random() > 0.5 ? 'Nam' : 'Nữ';
      
      let parentId = null;
      if (previousGenIds.length > 0) {
        parentId = previousGenIds[randomInt(0, previousGenIds.length - 1)];
      }

      const birthYear = currentYear + randomInt(-5, 5);
      const deathYear = isDeceased ? birthYear + randomInt(40, 85) : null;

      const data = {
        fullName: g === 0 ? "Phùng Tổ (Thủy Tổ)" : generateName(gender),
        gender,
        birthYear,
        deathYear,
        parentId,
        bio: g === 0 ? "Thủy tổ dòng họ Phùng Bát Tràng." : null
      };
      
      tasks.push(data);
      membersGenerated++;
    }
    
    // Prisma createMany is faster
    // but createMany does not return IDs in MongoDB (or returns insertedCount)
    // Wait, MongoDB createMany doesn't return the docs. We need IDs for parentId.
    // So we have to do it iteratively or in smaller parallel batches
    const BATCH_SIZE = 100;
    for (let b = 0; b < tasks.length; b += BATCH_SIZE) {
      const batch = tasks.slice(b, b + BATCH_SIZE);
      const results = await Promise.all(batch.map(t => prisma.member.create({ data: t })));
      currentGenIds.push(...results.map(r => r.id));
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