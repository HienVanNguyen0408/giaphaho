import { Request, Response } from 'express';
import { MemberService, getJob } from '../services/member.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

// ── Export helpers ────────────────────────────────────────────────────────────

type ExMember = {
  id: string;
  fullName: string;
  gender: string | null;
  birthYear: number | null;
  deathYear: number | null;
  generation: number | null;
  parentId: string | null;
  siblingOrder: number | null;
  bio: string | null;
};

function cmpSiblings(a: ExMember, b: ExMember): number {
  const ao = a.siblingOrder ?? Infinity;
  const bo = b.siblingOrder ?? Infinity;
  if (ao !== bo) return ao - bo;
  const ab = a.birthYear ?? Infinity;
  const bb = b.birthYear ?? Infinity;
  if (ab !== bb) return ab - bb;
  return a.fullName.localeCompare(b.fullName, 'vi');
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function toMd(members: ExMember[]): string {
  const childrenOf = new Map<string | null, ExMember[]>();
  for (const m of members) {
    const pid = m.parentId ?? null;
    if (!childrenOf.has(pid)) childrenOf.set(pid, []);
    childrenOf.get(pid)!.push(m);
  }

  const lines: string[] = [
    '# Gia Phả',
    '',
    `> Xuất ngày: ${new Date().toLocaleDateString('vi-VN')} · Tổng: ${members.length} thành viên`,
    '',
  ];

  const render = (m: ExMember, depth: number) => {
    const indent = '  '.repeat(depth);
    const life =
      m.birthYear || m.deathYear
        ? ` (${m.birthYear ?? '?'} – ${m.deathYear ? String(m.deathYear) : 'nay'})`
        : '';
    const gen = m.generation ? ` · Đời ${m.generation}` : '';
    lines.push(`${indent}- **${m.fullName}**${m.gender ? ` · ${m.gender}` : ''}${life}${gen}`);
    if (m.bio) lines.push(`${indent}  > ${m.bio.split('\n')[0]}`);
    const children = (childrenOf.get(m.id) ?? []).sort(cmpSiblings);
    for (const child of children) render(child, depth + 1);
  };

  for (const root of (childrenOf.get(null) ?? []).sort(cmpSiblings)) render(root, 0);
  return lines.join('\n');
}

function toHtml(members: ExMember[]): string {
  const childrenOf = new Map<string | null, ExMember[]>();
  for (const m of members) {
    const pid = m.parentId ?? null;
    if (!childrenOf.has(pid)) childrenOf.set(pid, []);
    childrenOf.get(pid)!.push(m);
  }

  const renderItem = (m: ExMember): string => {
    const life =
      m.birthYear || m.deathYear
        ? ` <span class="life">(${m.birthYear ?? '?'} – ${m.deathYear ? String(m.deathYear) : 'nay'})</span>`
        : '';
    const gen = m.generation ? ` <span class="gen">Đời ${m.generation}</span>` : '';
    const gender = m.gender
      ? ` <span class="g ${m.gender === 'Nam' ? 'male' : 'fem'}">${m.gender}</span>`
      : '';
    const children = (childrenOf.get(m.id) ?? []).sort(cmpSiblings);
    const childHtml = children.length > 0 ? `<ul>${children.map(renderItem).join('')}</ul>` : '';
    return `<li><span class="n">${esc(m.fullName)}</span>${gender}${life}${gen}${childHtml}</li>`;
  };

  const date = new Date().toLocaleDateString('vi-VN');
  const roots = (childrenOf.get(null) ?? []).sort(cmpSiblings);
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Gia Phả</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:"Times New Roman",serif;max-width:900px;margin:0 auto;padding:32px 24px;color:#1c1917;background:#fafaf9}
h1{font-size:2rem;text-align:center;margin-bottom:4px;color:#44403c}
.meta{text-align:center;color:#78716c;font-size:.9rem;margin-bottom:32px}
ul{list-style:none;padding-left:20px;border-left:2px solid #e7e5e4;margin:4px 0 4px 8px}
li{padding:3px 0 3px 8px;position:relative}
li::before{content:'';position:absolute;left:-10px;top:13px;width:8px;height:2px;background:#e7e5e4}
.n{font-weight:700;font-size:.95rem}
.life{font-size:.8rem;color:#78716c;margin-left:6px}
.gen{font-size:.75rem;color:#a78bfa;background:#f5f3ff;padding:1px 5px;border-radius:999px;margin-left:4px}
.g{font-size:.75rem;padding:1px 5px;border-radius:999px;margin-left:4px}
.male{background:#eff6ff;color:#1d4ed8}.fem{background:#fdf2f8;color:#be185d}
@media print{body{background:#fff;padding:16px}}
</style>
</head>
<body>
<h1>Gia Phả</h1>
<p class="meta">Xuất ngày: ${date} · Tổng: ${members.length} thành viên</p>
<ul>${roots.map(renderItem).join('')}</ul>
</body>
</html>`;
}

export const MemberController = {
  async getAll(req: Request, res: Response): Promise<void> {
    if (req.query['page'] !== undefined) {
      const page = Math.max(1, Number(req.query['page']) || 1);
      const limit = Math.max(1, Math.min(100, Number(req.query['limit']) || 12));
      const name = req.query['name'] ? String(req.query['name']) : undefined;
      const result = await MemberService.getPage(page, limit, name);
      sendSuccess(res, result);
    } else {
      const members = await MemberService.getAll();
      sendSuccess(res, members);
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = String(req.params['id']);
    try {
      const member = await MemberService.getById(id);
      sendSuccess(res, member);
    } catch (err) {
      const error = err as Error & { statusCode?: number };
      if (error.statusCode === 404) {
        sendError(res, error.message, 404);
      } else {
        throw err;
      }
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    const data = req.body as {
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
    };
    try {
      const member = await MemberService.create(data, req.user?.role, req.user?.chiId);
      sendCreated(res, member);
    } catch (err) {
      const error = err as Error & { statusCode?: number };
      if (error.statusCode === 403) {
        sendError(res, error.message, 403);
      } else {
        throw err;
      }
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params['id']);
    const data = req.body as {
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
    };
    const callerRole = req.user?.role ?? '';
    const callerChiId = req.user?.chiId ?? null;
    try {
      const member = await MemberService.update(id, data, callerRole, callerChiId);
      sendSuccess(res, member);
    } catch (err) {
      const error = err as Error & { statusCode?: number };
      if (error.statusCode === 403) {
        sendError(res, error.message, 403);
      } else if (error.statusCode === 404) {
        sendError(res, error.message, 404);
      } else {
        throw err;
      }
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params['id']);
    await MemberService.delete(id);
    res.status(204).send();
  },

  async exportData(req: Request, res: Response): Promise<void> {
    const format = String(req.query['format'] ?? 'json');
    const members = await MemberService.exportAll();
    const date = new Date().toISOString().slice(0, 10);

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="giaphaho-${date}.json"`);
      res.json({ exportedAt: new Date().toISOString(), total: members.length, members });
    } else if (format === 'md') {
      const md = toMd(members);
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="giaphaho-${date}.md"`);
      res.send(md);
    } else if (format === 'html') {
      const html = toHtml(members);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="giaphaho-${date}.html"`);
      res.send(html);
    } else {
      sendError(res, 'Định dạng không hỗ trợ. Dùng: json, md, html', 400);
    }
  },

  async importData(req: Request, res: Response): Promise<void> {
    const body = req.body as { members?: unknown[]; mode?: string };
    if (!Array.isArray(body.members)) {
      sendError(res, 'Dữ liệu không hợp lệ: thiếu trường "members"', 400);
      return;
    }
    const mode = body.mode === 'replace' ? 'replace' : 'merge';
    const result = await MemberService.importMembers(body.members, mode);
    sendSuccess(
      res,
      result,
      `Đã nhập ${result.created + result.updated} thành viên (${result.created} mới, ${result.updated} cập nhật)`,
    );
  },

  async recalculateStats(_req: Request, res: Response): Promise<void> {
    const jobId = MemberService.startRecalculation();
    sendSuccess(res, { jobId }, 'Đã bắt đầu tính lại số liệu');
  },

  async recalculateStatsEvents(req: Request, res: Response): Promise<void> {
    const jobId = req.query['jobId'] as string | undefined;
    if (!jobId) {
      sendError(res, 'Thiếu jobId', 400);
      return;
    }

    const job = getJob(jobId);
    if (!job) {
      sendError(res, 'Không tìm thấy job', 404);
      return;
    }

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const send = (event: string, data: unknown) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    // Job already finished — send terminal event and close immediately
    if (job.status === 'done') {
      send('done', job.result);
      res.end();
      return;
    }
    if (job.status === 'error') {
      send('error', { message: job.error });
      res.end();
      return;
    }

    // Subscribe to live events
    const onProgress = (data: unknown) => send('progress', data);
    const onDone = (data: unknown) => { send('done', data); res.end(); };
    const onError = (data: unknown) => { send('error', data); res.end(); };

    job.emitter.on('progress', onProgress);
    job.emitter.on('done', onDone);
    job.emitter.on('error', onError);

    // Heartbeat — keeps the connection alive through proxies
    const heartbeat = setInterval(() => {
      if (!res.writableEnded) res.write(': heartbeat\n\n');
    }, 15_000);

    req.on('close', () => {
      clearInterval(heartbeat);
      job.emitter.off('progress', onProgress);
      job.emitter.off('done', onDone);
      job.emitter.off('error', onError);
    });
  },
};
