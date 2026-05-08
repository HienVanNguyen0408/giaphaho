import prisma from '../lib/prisma';
import { Video } from '@prisma/client';

function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd');
}

export const VideoService = {
  async getAllOrdered() {
    return prisma.video.findMany({
      orderBy: { order: 'asc' },
    });
  },

  async getList(page: number, limit: number, keyword?: string) {
    const skip = (page - 1) * limit;
    const where = keyword
      ? {
          OR: [
            { titleSearch: { contains: normalizeSearch(keyword), mode: 'insensitive' as const } },
            { title: { contains: keyword, mode: 'insensitive' as const } },
          ],
        }
      : {};
    const [items, total] = await prisma.$transaction([
      prisma.video.findMany({
        where,
        orderBy: { order: 'asc' },
        skip,
        take: limit,
      }),
      prisma.video.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
  },

  async create(data: { title: string; youtubeUrl: string; thumbnailUrl?: string }): Promise<Video> {
    return prisma.video.create({ data: { ...data, titleSearch: normalizeSearch(data.title) } });
  },

  async update(id: string, data: Partial<{ title: string; youtubeUrl: string; thumbnailUrl: string }>): Promise<Video> {
    const updateData = { ...data, ...(data.title ? { titleSearch: normalizeSearch(data.title) } : {}) };
    return prisma.video.update({ where: { id }, data: updateData });
  },

  async delete(id: string): Promise<void> {
    await prisma.video.delete({ where: { id } });
  },

  async reorder(orderedIds: string[], startIndex = 0): Promise<void> {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.video.update({ where: { id }, data: { order: startIndex + index } }),
      ),
    );
  },
};
