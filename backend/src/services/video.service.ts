import prisma from '../lib/prisma';
import { Video } from '@prisma/client';

export const VideoService = {
  async getAllOrdered() {
    return prisma.video.findMany({
      orderBy: { order: 'asc' },
    });
  },

  async create(data: { title: string; youtubeUrl: string; thumbnailUrl?: string }): Promise<Video> {
    return prisma.video.create({ data });
  },

  async update(id: string, data: Partial<{ title: string; youtubeUrl: string; thumbnailUrl: string }>): Promise<Video> {
    return prisma.video.update({ where: { id }, data });
  },

  async delete(id: string): Promise<void> {
    await prisma.video.delete({ where: { id } });
  },

  async reorder(orderedIds: string[]): Promise<void> {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.video.update({ where: { id }, data: { order: index } }),
      ),
    );
  },
};
