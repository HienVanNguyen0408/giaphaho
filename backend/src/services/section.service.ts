import prisma from '../lib/prisma';
import { Section } from '@prisma/client';

export const SectionService = {
  async getActiveOrdered() {
    return prisma.section.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  },

  async getAll() {
    return prisma.section.findMany({
      orderBy: { order: 'asc' },
    });
  },

  async create(data: { name: string; newsId?: string; isActive?: boolean; order?: number }): Promise<Section> {
    return prisma.section.create({ data });
  },

  async update(id: string, data: Partial<Section>): Promise<Section> {
    return prisma.section.update({ where: { id }, data });
  },

  async delete(id: string): Promise<void> {
    await prisma.section.delete({ where: { id } });
  },

  async toggle(id: string): Promise<{ isActive: boolean }> {
    const section = await prisma.section.findUnique({ where: { id } });
    if (!section) {
      const error = new Error('Section not found');
      (error as Error & { statusCode: number }).statusCode = 404;
      throw error;
    }
    const updated = await prisma.section.update({ where: { id }, data: { isActive: !section.isActive } });
    return { isActive: updated.isActive };
  },
};
