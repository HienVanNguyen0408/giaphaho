import { prisma } from '../lib/prisma'

export interface ThemeData {
  primaryColor?: string
  accentColor?: string
  logo?: string
  favicon?: string
  fontFamily?: string
  customCss?: string
}

export async function getTheme(clanId: string) {
  const theme = await prisma.theme.findUnique({ where: { clanId } })
  if (!theme) throw new Error('THEME_NOT_FOUND')
  return theme
}

export async function updateTheme(clanId: string, data: ThemeData) {
  const clan = await prisma.clan.findUnique({ where: { id: clanId } })
  if (!clan) throw new Error('CLAN_NOT_FOUND')
  if (clan.licenseType !== 'SUBSCRIPTION') throw new Error('THEME_ONLY_FOR_SUBSCRIPTION')

  return prisma.theme.upsert({
    where: { clanId },
    create: { clanId, ...data },
    update: data,
  })
}

export async function getPublicTheme(clanCode: string) {
  const clan = await prisma.clan.findUnique({
    where: { code: clanCode },
    include: { theme: true },
  })

  if (!clan || clan.status !== 'ACTIVE') {
    return null
  }

  if (!clan.theme) {
    return {
      primaryColor: '#8B0000',
      accentColor: '#6B0000',
      fontFamily: 'Be Vietnam Pro',
      logo: null,
      favicon: null,
      customCss: null,
    }
  }

  return clan.theme
}

export async function deleteLogo(clanId: string) {
  return prisma.theme.update({
    where: { clanId },
    data: { logo: null },
  })
}

export async function deleteFavicon(clanId: string) {
  return prisma.theme.update({
    where: { clanId },
    data: { favicon: null },
  })
}
