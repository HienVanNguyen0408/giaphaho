import { prisma } from '../lib/prisma'
import nodemailer from 'nodemailer'

const WARN_DAYS = 30
const EMAIL_COOLDOWN_DAYS = 7

export async function scanExpiringLicenses() {
  const now = new Date()
  const warnDate = new Date(now.getTime() + WARN_DAYS * 24 * 60 * 60 * 1000)
  const cooldownDate = new Date(now.getTime() - EMAIL_COOLDOWN_DAYS * 24 * 60 * 60 * 1000)

  const expiringLicenses = await prisma.license.findMany({
    where: {
      type: 'SUBSCRIPTION',
      isRevoked: false,
      expiresAt: { gte: now, lte: warnDate },
      clan: { status: 'ACTIVE' },
    },
    include: { clan: true },
  })

  const expiredLicenses = await prisma.license.findMany({
    where: {
      type: 'SUBSCRIPTION',
      isRevoked: false,
      expiresAt: { lt: now },
      clan: { status: 'ACTIVE' },
    },
    include: { clan: true },
  })

  const created: string[] = []

  for (const license of expiringLicenses) {
    const existing = await prisma.notification.findFirst({
      where: {
        clanId: license.clanId,
        type: 'LICENSE_EXPIRY_WARNING',
        sentEmail: true,
        createdAt: { gte: cooldownDate },
      },
    })

    if (!existing) {
      const daysLeft = Math.ceil(
        (license.expiresAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      const notification = await createNotification({
        clanId: license.clanId,
        type: 'LICENSE_EXPIRY_WARNING',
        message: `License của họ "${license.clan.name}" sẽ hết hạn trong ${daysLeft} ngày (${license.expiresAt!.toLocaleDateString('vi-VN')})`,
      })
      created.push(notification.id)

      if (license.clan.contactEmail) {
        await sendExpiryEmail(
          license.clan.contactEmail,
          license.clan.name,
          daysLeft,
          license.expiresAt!
        )
        await prisma.notification.update({
          where: { id: notification.id },
          data: { sentEmail: true },
        })
      }
    }
  }

  for (const license of expiredLicenses) {
    await prisma.clan.update({
      where: { id: license.clanId },
      data: { status: 'EXPIRED' },
    })

    const notification = await createNotification({
      clanId: license.clanId,
      type: 'LICENSE_EXPIRED',
      message: `License của họ "${license.clan.name}" đã hết hạn. Website đã bị tạm dừng.`,
    })
    created.push(notification.id)
  }

  return { created: created.length }
}

export async function createNotification(data: {
  clanId?: string
  type: string
  message: string
}) {
  return prisma.notification.create({ data })
}

export async function listNotifications() {
  return prisma.notification.findMany({
    orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
    take: 100,
  })
}

export async function markRead(id: string) {
  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  })
}

export async function markAllRead() {
  return prisma.notification.updateMany({
    where: { isRead: false },
    data: { isRead: true },
  })
}

async function sendExpiryEmail(to: string, clanName: string, daysLeft: number, expiresAt: Date) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? 'noreply@giaphaho.vn',
    to,
    subject: `[Gia Phả Hồ] License sắp hết hạn — ${clanName}`,
    html: `
      <h2>Thông báo license sắp hết hạn</h2>
      <p>Kính gửi,</p>
      <p>License của <strong>${clanName}</strong> trên nền tảng Gia Phả Hồ sẽ hết hạn trong <strong>${daysLeft} ngày</strong> (${expiresAt.toLocaleDateString('vi-VN')}).</p>
      <p>Vui lòng liên hệ Super Admin để gia hạn.</p>
      <p>Trân trọng,<br/>Gia Phả Hồ Platform</p>
    `,
  })
}
