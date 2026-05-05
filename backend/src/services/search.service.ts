import prisma from '../lib/prisma';

export const SearchService = {
  async search(q: string) {
    if (q.length < 2) {
      return { members: [], news: [], videos: [] };
    }

    const [members, news, videos] = await Promise.all([
      prisma.member.findMany({
        where: { fullName: { contains: q, mode: 'insensitive' } },
        select: { id: true, fullName: true, avatar: true },
      }),
      prisma.news.findMany({
        where: { title: { contains: q, mode: 'insensitive' } },
        select: { id: true, title: true, slug: true, thumbnail: true },
      }),
      prisma.video.findMany({
        where: { title: { contains: q, mode: 'insensitive' } },
        select: { id: true, title: true, youtubeUrl: true },
      }),
    ]);

    return { members, news, videos };
  },
};
