import prisma from '../lib/prisma';

export const MemberService = {
  async getAll() {
    return prisma.member.findMany({
      select: {
        id: true,
        fullName: true,
        avatar: true,
        birthYear: true,
        deathYear: true,
        gender: true,
        chiId: true,
        parentId: true,
      },
    });
  },

  async getById(id: string) {
    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, fullName: true } },
        children: { select: { id: true, fullName: true } },
      },
    });
    if (!member) {
      const error = new Error('Member not found');
      (error as Error & { statusCode: number }).statusCode = 404;
      throw error;
    }
    return member;
  },

  async create(
    data: {
      fullName: string;
      avatar?: string;
      birthYear?: number;
      deathYear?: number;
      gender?: string;
      bio?: string;
      achievements?: string[];
      parentId?: string;
      chiId?: string;
    },
    callerRole?: string,
    callerChiId?: string | null,
  ) {
    if (callerRole === 'CHI_ADMIN' && data.chiId && data.chiId !== callerChiId) {
      const error = new Error('Cannot create member for a different chi');
      (error as Error & { statusCode: number }).statusCode = 403;
      throw error;
    }
    return prisma.member.create({ data });
  },

  async update(
    id: string,
    data: {
      fullName?: string;
      avatar?: string;
      birthYear?: number;
      deathYear?: number;
      gender?: string;
      bio?: string;
      achievements?: string[];
      parentId?: string;
      chiId?: string;
    },
    callerRole: string,
    callerChiId: string | null,
  ) {
    if (callerRole === 'CHI_ADMIN') {
      const existing = await prisma.member.findUnique({ where: { id } });
      if (!existing) {
        const error = new Error('Member not found');
        (error as Error & { statusCode: number }).statusCode = 404;
        throw error;
      }
      if (existing.chiId !== callerChiId) {
        const error = new Error('Insufficient permissions to update this member');
        (error as Error & { statusCode: number }).statusCode = 403;
        throw error;
      }
    }
    return prisma.member.update({ where: { id }, data });
  },

  async delete(id: string) {
    await prisma.member.updateMany({
      where: { parentId: id },
      data: { parentId: null },
    });
    return prisma.member.delete({ where: { id } });
  },
};
