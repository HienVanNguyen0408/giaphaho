import prisma from '../lib/prisma';
import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';

// ── Job registry for background recalculation ──────────────────────────────

type JobState =
  | { status: 'running'; emitter: EventEmitter; startedAt: number }
  | { status: 'done'; emitter: EventEmitter; startedAt: number; result: RecalcResult }
  | { status: 'error'; emitter: EventEmitter; startedAt: number; error: string };

interface RecalcResult {
  updated: number;
  durationMs: number;
}

const jobRegistry = new Map<string, JobState & { cleanupTimer?: ReturnType<typeof setTimeout> }>();

function scheduleCleanup(jobId: string) {
  const job = jobRegistry.get(jobId);
  if (!job) return;
  job.cleanupTimer = setTimeout(() => {
    jobRegistry.delete(jobId);
  }, 5 * 60 * 1000); // keep for 5 min after completion
}

export function getJob(jobId: string) {
  return jobRegistry.get(jobId) ?? null;
}

// ── O(n) stats computation ─────────────────────────────────────────────────

interface MinMember {
  id: string;
  parentId: string | null;
  gender: string | null;
}

interface MemberStats {
  generation: number;
  siblingsCount: number;
  sonsCount: number;
  daughtersCount: number;
  descendantsCount: number;
}

function computeAllStats(members: MinMember[]): Map<string, MemberStats> {
  const n = members.length;
  if (n === 0) return new Map();

  // Build adjacency map once — O(n)
  const childrenOf = new Map<string, string[]>();
  const parentOf = new Map<string, string | null>();
  const genderOf = new Map<string, string | null>();
  const validIds = new Set(members.map((m) => m.id));

  for (const m of members) {
    genderOf.set(m.id, m.gender);
    // Treat dangling parentId (deleted parent) as root
    const effectiveParent = m.parentId && validIds.has(m.parentId) ? m.parentId : null;
    parentOf.set(m.id, effectiveParent);
    if (effectiveParent) {
      let list = childrenOf.get(effectiveParent);
      if (!list) { list = []; childrenOf.set(effectiveParent, list); }
      list.push(m.id);
    }
  }

  // BFS from roots → compute generation, record traversal order — O(n)
  const generationOf = new Map<string, number>();
  const bfsOrder: string[] = [];
  const queue: Array<{ id: string; gen: number }> = [];

  for (const m of members) {
    if (!parentOf.get(m.id)) queue.push({ id: m.id, gen: 1 });
  }

  const enqueued = new Set<string>(queue.map((x) => x.id));
  while (queue.length > 0) {
    const { id, gen } = queue.shift()!;
    generationOf.set(id, gen);
    bfsOrder.push(id);
    for (const childId of childrenOf.get(id) ?? []) {
      if (!enqueued.has(childId)) {
        enqueued.add(childId);
        queue.push({ id: childId, gen: gen + 1 });
      }
    }
  }
  // Handle any orphaned cycles not reached from roots
  for (const m of members) {
    if (!generationOf.has(m.id)) {
      generationOf.set(m.id, 1);
      bfsOrder.push(m.id);
    }
  }

  // Reverse BFS order = leaves before parents → compute descendantsCount — O(n)
  const descendantsOf = new Map<string, number>();
  for (let i = bfsOrder.length - 1; i >= 0; i--) {
    const id = bfsOrder[i];
    const children = childrenOf.get(id) ?? [];
    descendantsOf.set(
      id,
      children.reduce((sum, cid) => sum + 1 + (descendantsOf.get(cid) ?? 0), 0),
    );
  }

  // Assemble final stats map — O(n)
  const result = new Map<string, MemberStats>();
  for (const m of members) {
    const pid = parentOf.get(m.id);
    const children = childrenOf.get(m.id) ?? [];
    result.set(m.id, {
      generation: generationOf.get(m.id) ?? 1,
      siblingsCount: pid ? (childrenOf.get(pid) ?? []).filter((id) => id !== m.id).length : 0,
      sonsCount: children.filter((id) => genderOf.get(id) === 'Nam').length,
      daughtersCount: children.filter((id) => genderOf.get(id) === 'Nữ').length,
      descendantsCount: descendantsOf.get(m.id) ?? 0,
    });
  }

  return result;
}

// ── Background runner ──────────────────────────────────────────────────────

const BATCH_SIZE = 100;

async function runRecalculation(jobId: string): Promise<void> {
  const job = jobRegistry.get(jobId);
  if (!job || job.status !== 'running') return;

  const emit = job.emitter.emit.bind(job.emitter);
  const startedAt = job.startedAt;

  try {
    // 1. Fetch only what's needed for computation
    emit('progress', { step: 'loading', processed: 0, total: 0 });
    const members = await prisma.member.findMany({
      select: { id: true, parentId: true, gender: true },
    });
    const total = members.length;
    emit('progress', { step: 'computing', processed: 0, total });

    // 2. O(n) computation — no DB calls
    const statsMap = computeAllStats(members);
    emit('progress', { step: 'saving', processed: 0, total });

    // 3. Batched parallel writes — much faster than a single giant transaction
    let processed = 0;
    for (let i = 0; i < members.length; i += BATCH_SIZE) {
      const batch = members.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map((m) => {
          const s = statsMap.get(m.id)!;
          return prisma.member.update({
            where: { id: m.id },
            data: {
              generation: s.generation,
              siblingsCount: s.siblingsCount,
              sonsCount: s.sonsCount,
              daughtersCount: s.daughtersCount,
              descendantsCount: s.descendantsCount,
            },
            select: { id: true },
          });
        }),
      );
      processed = Math.min(i + BATCH_SIZE, total);
      emit('progress', { step: 'saving', processed, total });
    }

    const durationMs = Date.now() - startedAt;
    const result: RecalcResult = { updated: total, durationMs };
    jobRegistry.set(jobId, { ...job, status: 'done', result });
    emit('done', result);
    scheduleCleanup(jobId);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    jobRegistry.set(jobId, { ...job, status: 'error', error: message });
    emit('error', { message });
    scheduleCleanup(jobId);
  }
}

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
        siblingOrder: true,
        achievements: true,
        descendantsCount: true,
        generation: true,
        siblingsCount: true,
        spousesCount: true,
        sonsCount: true,
        daughtersCount: true,
        residence: true,
        burialPlace: true,
        fieldConfig: true,
        spouses: true,
        motherName: true,
        contributions: true,
      },
    });
  },

  async getPage(page: number, limit: number, name?: string) {
    const nameFilter = name ? { fullName: { contains: name, mode: 'insensitive' as const } } : {};
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
      siblingOrder: true,
      achievements: true,
      descendantsCount: true,
      generation: true,
      siblingsCount: true,
      spousesCount: true,
      sonsCount: true,
      daughtersCount: true,
      residence: true,
      burialPlace: true,
      fieldConfig: true,
      spouses: true,
      motherName: true,
      contributions: true,
    };
    // Fetch all matching docs so we can sort nulls-last on generation (MongoDB nulls-first by default)
    const allItems = await prisma.member.findMany({ where: nameFilter, select });
    const sorted = allItems.sort((a, b) => {
      const ga = a.generation ?? Infinity;
      const gb = b.generation ?? Infinity;
      if (ga !== gb) return ga - gb;
      return a.fullName.localeCompare(b.fullName, 'vi');
    });
    const total = sorted.length;
    const items = sorted.slice(skip, skip + limit);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async getById(id: string) {
    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, fullName: true } },
        children: { select: { id: true, fullName: true, gender: true, motherName: true } },
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
      siblingOrder?: number | null;
      chiId?: string;
      residence?: string;
      nationalId?: string;
      phone?: string;
      email?: string;
      bankAccount?: string;
      burialPlace?: string;
      fieldConfig?: Record<string, boolean>;
      spouses?: string[];
      motherName?: string;
      contributions?: string[];
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
      siblingOrder?: number | null;
      chiId?: string;
      residence?: string;
      nationalId?: string;
      phone?: string;
      email?: string;
      bankAccount?: string;
      burialPlace?: string;
      fieldConfig?: Record<string, boolean>;
      spouses?: string[];
      motherName?: string;
      contributions?: string[];
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

  startRecalculation(): string {
    const jobId = randomUUID();
    const emitter = new EventEmitter();
    emitter.setMaxListeners(20); // allow multiple SSE clients
    jobRegistry.set(jobId, { status: 'running', emitter, startedAt: Date.now() });
    // Fire-and-forget — does not block the request
    setImmediate(() => runRecalculation(jobId));
    return jobId;
  },

  async exportAll() {
    return prisma.member.findMany({
      orderBy: [
        { generation: 'asc' },
        { siblingOrder: 'asc' },
        { fullName: 'asc' },
      ],
    });
  },

  async importMembers(
    members: unknown[],
    mode: 'merge' | 'replace',
  ): Promise<{ created: number; updated: number; total: number }> {
    type Raw = Record<string, unknown>;

    const valid = members.filter(
      (m): m is Raw =>
        typeof m === 'object' && m !== null && typeof (m as Raw)['fullName'] === 'string',
    );

    const str = (v: unknown): string | null => (v != null && v !== '' ? String(v) : null);
    const num = (v: unknown): number | null => {
      const n = Number(v);
      return v != null && v !== '' && !isNaN(n) ? n : null;
    };
    const arr = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

    const extract = (m: Raw) => ({
      fullName: String(m['fullName']),
      avatar: str(m['avatar']),
      birthYear: num(m['birthYear']),
      birthDate: str(m['birthDate']),
      deathYear: num(m['deathYear']),
      deathDate: str(m['deathDate']),
      gender: str(m['gender']),
      bio: str(m['bio']),
      achievements: arr(m['achievements']),
      parentId: str(m['parentId']),
      siblingOrder: num(m['siblingOrder']),
      chiId: str(m['chiId']),
      residence: str(m['residence']),
      nationalId: str(m['nationalId']),
      phone: str(m['phone']),
      email: str(m['email']),
      bankAccount: str(m['bankAccount']),
      burialPlace: str(m['burialPlace']),
      fieldConfig: m['fieldConfig'] != null ? (m['fieldConfig'] as Record<string, boolean>) : undefined,
      spouses: arr(m['spouses']),
      motherName: str(m['motherName']),
      contributions: arr(m['contributions']),
    });

    if (mode === 'replace') {
      await prisma.member.updateMany({ data: { parentId: null } });
      await prisma.member.deleteMany({});
      let created = 0;
      for (let i = 0; i < valid.length; i += BATCH_SIZE) {
        const batch = valid.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map((m) => {
            const id = str(m['id']);
            const data = extract(m);
            return id
              ? prisma.member.create({ data: { id, ...data }, select: { id: true } })
              : prisma.member.create({ data, select: { id: true } });
          }),
        );
        created += batch.length;
      }
      return { created, updated: 0, total: valid.length };
    }

    // Merge: check which IDs already exist
    const existingIds = new Set(
      (await prisma.member.findMany({ select: { id: true } })).map((m) => m.id),
    );

    let created = 0;
    let updated = 0;

    for (let i = 0; i < valid.length; i += BATCH_SIZE) {
      const batch = valid.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map((m) => {
          const id = str(m['id']);
          const data = extract(m);
          if (id && existingIds.has(id)) {
            updated++;
            return prisma.member.update({ where: { id }, data, select: { id: true } });
          }
          created++;
          return id
            ? prisma.member.create({ data: { id, ...data }, select: { id: true } })
            : prisma.member.create({ data, select: { id: true } });
        }),
      );
    }

    return { created, updated, total: valid.length };
  },
};
