import prisma from '../lib/prisma';

export const MemberService = {
  async getAll() {
    return prisma.member.findMany({
      select: {
        id: true,
        fullName: true,
        avatar: true,
        birthYear: true,
        birthDate: true,
        deathYear: true,
        deathDate: true,
        gender: true,
        chiId: true,
        parentId: true,
        descendantsCount: true,
        generation: true,
        siblingsCount: true,
        spousesCount: true,
        sonsCount: true,
        daughtersCount: true,
      },
    });
  },

  async getPage(page: number, limit: number, name?: string) {
    const where = name ? { fullName: { contains: name, mode: 'insensitive' as const } } : {};
    const skip = (page - 1) * limit;
    const select = {
      id: true,
      fullName: true,
      avatar: true,
      birthYear: true,
      birthDate: true,
      deathYear: true,
      deathDate: true,
      gender: true,
      chiId: true,
      parentId: true,
      descendantsCount: true,
      generation: true,
      siblingsCount: true,
      spousesCount: true,
      sonsCount: true,
      daughtersCount: true,
    };
    const [items, total] = await prisma.$transaction([
      prisma.member.findMany({ where, select, skip, take: limit, orderBy: { fullName: 'asc' } }),
      prisma.member.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
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
      birthDate?: string;
      deathYear?: number;
      deathDate?: string;
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
      birthDate?: string;
      deathYear?: number;
      deathDate?: string;
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

  async recalculateAllStats() {
    const members = await prisma.member.findMany();
    const memberMap = new Map(members.map((m) => [m.id, m]));

    const getGeneration = (id: string, visited = new Set<string>()): number => {
      if (visited.has(id)) return 1;
      visited.add(id);
      const m = memberMap.get(id);
      if (!m || !m.parentId) return 1;
      return 1 + getGeneration(m.parentId, visited);
    };

    const getDescendantsCount = (id: string, visited = new Set<string>()): number => {
      if (visited.has(id)) return 0;
      visited.add(id);
      const children = members.filter((m) => m.parentId === id);
      return children.length + children.reduce((sum, c) => sum + getDescendantsCount(c.id, new Set(visited)), 0);
    };

    await prisma.$transaction(
      members.map((member) => {
        const children = members.filter((m) => m.parentId === member.id);
        const siblings = member.parentId
          ? members.filter((m) => m.parentId === member.parentId && m.id !== member.id)
          : [];
        return prisma.member.update({
          where: { id: member.id },
          data: {
            generation: getGeneration(member.id),
            siblingsCount: siblings.length,
            sonsCount: children.filter((c) => c.gender === 'Nam').length,
            daughtersCount: children.filter((c) => c.gender === 'Nữ').length,
            descendantsCount: getDescendantsCount(member.id),
          },
        });
      }),
    );
  },
};
