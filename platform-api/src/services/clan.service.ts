import { prisma } from '../lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import type { createClanSchema, updateClanSchema, updateStatusSchema } from '../validators/clan.validator'
import type { z } from 'zod'

const PAGE_SIZE = 20

export async function listClans(params: {
  status?: string
  licenseType?: string
  search?: string
  page?: number
}) {
  const { status, licenseType, search, page = 1 } = params
  const skip = (page - 1) * PAGE_SIZE

  const where = {
    ...(status ? { status } : {}),
    ...(licenseType ? { licenseType } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { code: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [clans, total] = await Promise.all([
    prisma.clan.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: 'desc' },
      include: {
        licenses: {
          where: { isRevoked: false },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    }),
    prisma.clan.count({ where }),
  ])

  return { clans, total, page, totalPages: Math.ceil(total / PAGE_SIZE) }
}

export async function createClan(data: z.infer<typeof createClanSchema>) {
  const licenseKey = uuidv4()

  const clan = await prisma.clan.create({
    data: {
      name: data.name,
      code: data.code,
      licenseType: data.licenseType,
      subdomain: data.subdomain,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      address: data.address,
      notes: data.notes,
      licenses: {
        create: {
          type: data.licenseType,
          key: licenseKey,
          activatedAt: new Date(),
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
          maxDownloads: data.licenseType === 'PERMANENT' ? 3 : 0,
        },
      },
      ...(data.licenseType === 'SUBSCRIPTION'
        ? {
            theme: {
              create: {
                primaryColor: '#8B0000',
                accentColor: '#6B0000',
                fontFamily: 'Be Vietnam Pro',
              },
            },
          }
        : {}),
    },
    include: { licenses: true },
  })

  return { clan, licenseKey }
}

export async function getClanById(id: string) {
  const clan = await prisma.clan.findUnique({
    where: { id },
    include: {
      licenses: { orderBy: { createdAt: 'desc' } },
      theme: true,
      activityLogs: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { admin: { select: { id: true, name: true, email: true } } },
      },
    },
  })

  if (!clan) throw new Error('CLAN_NOT_FOUND')
  return clan
}

export async function updateClan(id: string, data: z.infer<typeof updateClanSchema>) {
  const existing = await prisma.clan.findUnique({ where: { id } })
  if (!existing) throw new Error('CLAN_NOT_FOUND')

  return prisma.clan.update({
    where: { id },
    data,
  })
}

export async function updateClanStatus(id: string, status: z.infer<typeof updateStatusSchema>['status']) {
  const existing = await prisma.clan.findUnique({ where: { id } })
  if (!existing) throw new Error('CLAN_NOT_FOUND')

  return prisma.clan.update({ where: { id }, data: { status } })
}

export async function deleteClan(id: string) {
  const existing = await prisma.clan.findUnique({ where: { id } })
  if (!existing) throw new Error('CLAN_NOT_FOUND')

  return prisma.clan.delete({ where: { id } })
}
