import prisma from '../lib/prisma';
import { News } from '@prisma/client';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const NewsService = {
  async getPinned() {
    return prisma.news.findMany({
      where: { isPinned: true },
      orderBy: [{ order: 'asc' }, { publishedAt: 'desc' }],
    });
  },

  async getList(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await prisma.$transaction([
      prisma.news.findMany({
        orderBy: [{ order: 'asc' }, { publishedAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.news.count(),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { items, total, page, limit, totalPages };
  },

  async getBySlug(slug: string) {
    const news = await prisma.news.findUnique({ where: { slug } });
    if (!news) {
      const error = new Error('News not found');
      (error as Error & { statusCode: number }).statusCode = 404;
      throw error;
    }
    return news;
  },

  async getById(id: string) {
    const news = await prisma.news.findUnique({ where: { id } });
    if (!news) {
      const error = new Error('News not found');
      (error as Error & { statusCode: number }).statusCode = 404;
      throw error;
    }
    return news;
  },

  async create(data: { title: string; content: string; thumbnail?: string; isPinned?: boolean }): Promise<News> {
    const baseSlug = slugify(data.title);
    let slug = baseSlug;
    let counter = 2;
    while (await prisma.news.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    const last = await prisma.news.findFirst({ orderBy: { order: 'desc' } });
    return prisma.news.create({
      data: {
        title: data.title,
        content: data.content,
        thumbnail: data.thumbnail,
        isPinned: data.isPinned ?? false,
        order: (last?.order ?? -1) + 1,
        slug,
      },
    });
  },

  async update(id: string, data: Partial<{ title: string; content: string; thumbnail: string; isPinned: boolean }>): Promise<News> {
    return prisma.news.update({ where: { id }, data });
  },

  async delete(id: string): Promise<void> {
    await prisma.news.delete({ where: { id } });
  },

  async togglePin(id: string): Promise<{ isPinned: boolean }> {
    const news = await prisma.news.findUnique({ where: { id } });
    if (!news) {
      const error = new Error('News not found');
      (error as Error & { statusCode: number }).statusCode = 404;
      throw error;
    }
    const updated = await prisma.news.update({ where: { id }, data: { isPinned: !news.isPinned } });
    return { isPinned: updated.isPinned };
  },

  async reorder(orderedIds: string[]): Promise<void> {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.news.update({ where: { id }, data: { order: index } }),
      ),
    );
  },
};
