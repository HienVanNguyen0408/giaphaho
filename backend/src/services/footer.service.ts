import prisma from '../lib/prisma';
import { FooterConfig } from '@prisma/client';

export const FooterService = {
  async get(): Promise<FooterConfig | null> {
    return prisma.footerConfig.findFirst();
  },

  async upsert(data: { contact: string; description: string; copyright: string }): Promise<FooterConfig> {
    const existing = await prisma.footerConfig.findFirst();
    if (existing) {
      return prisma.footerConfig.update({ where: { id: existing.id }, data });
    }
    return prisma.footerConfig.create({ data });
  },
};
