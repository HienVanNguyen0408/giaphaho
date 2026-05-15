import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.SUPER_ADMIN_DEFAULT_EMAIL ?? 'admin@giaphaho.vn'
  const password = process.env.SUPER_ADMIN_DEFAULT_PASSWORD ?? 'SuperAdmin@2026'

  const hashedPassword = await bcrypt.hash(password, 12)

  const admin = await prisma.platformAdmin.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  })

  console.log(`Super Admin created: ${admin.email}`)

  // Seed nvhien account
  const nvhienHashedPassword = await bcrypt.hash('nvhien@123', 12)
  const nvhien = await prisma.platformAdmin.upsert({
    where: { email: 'nvhien@gmail.com' },
    update: {},
    create: {
      email: 'nvhien@gmail.com',
      password: nvhienHashedPassword,
      name: 'Nguyễn Văn Hiên',
      role: 'SUPER_ADMIN',
    },
  })
  console.log(`Admin created: ${nvhien.email}`)

  // Seed sample clans
  const permanentClan = await prisma.clan.upsert({
    where: { code: 'ho-phung-bat-trang' },
    update: {},
    create: {
      name: 'Họ Phùng Bát Tràng',
      code: 'ho-phung-bat-trang',
      licenseType: 'PERMANENT',
      status: 'ACTIVE',
      contactName: 'Phùng Văn A',
      contactEmail: 'contact@phungbattrang.vn',
      contactPhone: '0901234567',
      licenses: {
        create: {
          type: 'PERMANENT',
          key: uuidv4(),
          maxDownloads: 3,
        },
      },
    },
  })

  console.log(`Clan created: ${permanentClan.name}`)

  const subscriptionClan = await prisma.clan.upsert({
    where: { code: 'ho-nguyen-van' },
    update: {},
    create: {
      name: 'Họ Nguyễn Văn',
      code: 'ho-nguyen-van',
      licenseType: 'SUBSCRIPTION',
      status: 'ACTIVE',
      subdomain: 'ho-nguyen-van.giaphaho.vn',
      contactName: 'Nguyễn Văn B',
      contactEmail: 'contact@nguyenvan.vn',
      contactPhone: '0907654321',
      licenses: {
        create: {
          type: 'SUBSCRIPTION',
          key: uuidv4(),
          activatedAt: new Date(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        },
      },
      theme: {
        create: {
          primaryColor: '#8B0000',
          accentColor: '#6B0000',
          fontFamily: 'Be Vietnam Pro',
        },
      },
    },
  })

  console.log(`Clan created: ${subscriptionClan.name}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
