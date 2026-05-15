import { prisma } from '../lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'

export async function generateKey(clanId: string, expiresAt?: string) {
  const clan = await prisma.clan.findUnique({ where: { id: clanId } })
  if (!clan) throw new Error('CLAN_NOT_FOUND')

  const key = uuidv4()

  const license = await prisma.license.create({
    data: {
      clanId,
      type: clan.licenseType,
      key,
      activatedAt: new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      maxDownloads: clan.licenseType === 'PERMANENT' ? 3 : 0,
    },
  })

  return license
}

export async function revokeKey(clanId: string, licenseId: string) {
  const license = await prisma.license.findFirst({
    where: { id: licenseId, clanId },
  })
  if (!license) throw new Error('LICENSE_NOT_FOUND')

  return prisma.license.update({
    where: { id: licenseId },
    data: { isRevoked: true },
  })
}

export async function renewKey(clanId: string, licenseId: string, months: number) {
  const license = await prisma.license.findFirst({
    where: { id: licenseId, clanId, isRevoked: false },
  })
  if (!license) throw new Error('LICENSE_NOT_FOUND')

  const currentExpiry = license.expiresAt ?? new Date()
  const newExpiry = new Date(currentExpiry)
  newExpiry.setMonth(newExpiry.getMonth() + months)

  return prisma.license.update({
    where: { id: licenseId },
    data: { expiresAt: newExpiry },
  })
}

export async function validateKey(key: string) {
  const license = await prisma.license.findUnique({
    where: { key },
    include: { clan: { select: { code: true, status: true } } },
  })

  if (!license) {
    return { valid: false, reason: 'KEY_NOT_FOUND' }
  }

  if (license.isRevoked) {
    return { valid: false, reason: 'KEY_REVOKED' }
  }

  if (license.clan.status !== 'ACTIVE') {
    return { valid: false, reason: 'CLAN_SUSPENDED' }
  }

  if (license.expiresAt && license.expiresAt < new Date()) {
    return { valid: false, reason: 'KEY_EXPIRED', expiresAt: license.expiresAt }
  }

  const daysLeft = license.expiresAt
    ? Math.ceil((license.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return {
    valid: true,
    type: license.type,
    expiresAt: license.expiresAt,
    clanCode: license.clan.code,
    status: license.clan.status,
    daysLeft,
  }
}

export async function getLicenseHistory(clanId: string) {
  return prisma.license.findMany({
    where: { clanId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function generateDownloadToken(clanId: string) {
  const clan = await prisma.clan.findUnique({
    where: { id: clanId },
    include: {
      licenses: {
        where: { isRevoked: false, type: 'PERMANENT' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  if (!clan) throw new Error('CLAN_NOT_FOUND')

  const license = clan.licenses[0]
  if (!license) throw new Error('NO_ACTIVE_LICENSE')

  if (license.downloadCount >= license.maxDownloads) {
    throw new Error('DOWNLOAD_LIMIT_EXCEEDED')
  }

  const token = jwt.sign(
    { licenseId: license.id, clanId },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  )

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await prisma.downloadLog.create({
    data: {
      licenseId: license.id,
      token,
      expiresAt,
    },
  })

  return { token, expiresAt }
}

export async function processDownload(token: string, ip?: string, userAgent?: string) {
  let payload: { licenseId: string; clanId: string }

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET as string) as typeof payload
  } catch {
    throw new Error('INVALID_TOKEN')
  }

  const downloadLog = await prisma.downloadLog.findUnique({ where: { token } })
  if (!downloadLog) throw new Error('TOKEN_NOT_FOUND')
  if (downloadLog.usedAt) throw new Error('TOKEN_ALREADY_USED')
  if (downloadLog.expiresAt < new Date()) throw new Error('TOKEN_EXPIRED')

  await prisma.$transaction([
    prisma.downloadLog.update({
      where: { token },
      data: { usedAt: new Date(), ip, userAgent },
    }),
    prisma.license.update({
      where: { id: payload.licenseId },
      data: { downloadCount: { increment: 1 } },
    }),
  ])

  return { success: true }
}
