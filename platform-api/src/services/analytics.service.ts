import { prisma } from '../lib/prisma'

export async function getOverview() {
  const [total, active, suspended, expired, permanent, subscription] = await Promise.all([
    prisma.clan.count(),
    prisma.clan.count({ where: { status: 'ACTIVE' } }),
    prisma.clan.count({ where: { status: 'SUSPENDED' } }),
    prisma.clan.count({ where: { status: 'EXPIRED' } }),
    prisma.clan.count({ where: { licenseType: 'PERMANENT' } }),
    prisma.clan.count({ where: { licenseType: 'SUBSCRIPTION' } }),
  ])

  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  const expiringIn30Days = await prisma.license.count({
    where: {
      type: 'SUBSCRIPTION',
      isRevoked: false,
      expiresAt: { gte: new Date(), lte: thirtyDaysFromNow },
      clan: { status: 'ACTIVE' },
    },
  })

  return {
    totalClans: total,
    activeClans: active,
    suspendedClans: suspended,
    expiredClans: expired,
    permanentClans: permanent,
    subscriptionClans: subscription,
    expiringIn30Days,
  }
}

export async function getClansPerMonth() {
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11)
  twelveMonthsAgo.setDate(1)
  twelveMonthsAgo.setHours(0, 0, 0, 0)

  const clans = await prisma.clan.findMany({
    where: { createdAt: { gte: twelveMonthsAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  const monthMap = new Map<string, number>()

  for (let i = 11; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthMap.set(key, 0)
  }

  for (const clan of clans) {
    const key = `${clan.createdAt.getFullYear()}-${String(clan.createdAt.getMonth() + 1).padStart(2, '0')}`
    monthMap.set(key, (monthMap.get(key) ?? 0) + 1)
  }

  const data = Array.from(monthMap.entries()).map(([month, count]) => ({ month, count }))

  return { data }
}

export async function getLicenseBreakdown() {
  const [permanent, subscription] = await Promise.all([
    prisma.clan.count({ where: { licenseType: 'PERMANENT' } }),
    prisma.clan.count({ where: { licenseType: 'SUBSCRIPTION' } }),
  ])
  return { permanent, subscription }
}

export async function getExpiryList(days = 30) {
  const cutoff = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

  const licenses = await prisma.license.findMany({
    where: {
      type: 'SUBSCRIPTION',
      isRevoked: false,
      expiresAt: { gte: new Date(), lte: cutoff },
    },
    include: { clan: { select: { id: true, name: true, code: true, status: true, contactEmail: true } } },
    orderBy: { expiresAt: 'asc' },
  })

  return { clans: licenses }
}
