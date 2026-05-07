import type { Member, PaginatedResponse } from '@/types';
import { getMembers, getMembersPage } from './api';

// ── Tunables ────────────────────────────────────────────────────────────────

const FULL_TTL = 5 * 60 * 1000;   // 5 min  – all-members list (tree/lineage)
const PAGE_TTL = 2 * 60 * 1000;   // 2 min  – paginated pages
const MAX_PAGE_ENTRIES = 50;       // max cached page slots before eviction

// ── Full-list cache (tree view, lineage modal) ───────────────────────────────

let _full: { data: Member[]; ts: number } | null = null;

export async function getCachedAllMembers(): Promise<Member[]> {
  if (_full && Date.now() - _full.ts < FULL_TTL) return _full.data;
  const res = await getMembers();
  _full = { data: res.data, ts: Date.now() };
  return _full.data;
}

// ── Page cache (table / grid view) ──────────────────────────────────────────

type PageEntry = { data: PaginatedResponse<Member>; ts: number };

const _pages = new Map<string, PageEntry>();

function pageKey(page: number, limit: number, name?: string): string {
  return `${page}|${limit}|${name ?? ''}`;
}

/** Evict the single oldest entry when over capacity. */
function evictIfNeeded(): void {
  if (_pages.size < MAX_PAGE_ENTRIES) return;
  let oldestKey = '';
  let oldestTs = Infinity;
  for (const [k, v] of _pages) {
    if (v.ts < oldestTs) { oldestTs = v.ts; oldestKey = k; }
  }
  if (oldestKey) _pages.delete(oldestKey);
}

/**
 * Returns any cached data for this page (even stale).
 * Returns null if no entry exists at all.
 * Use this for the "show stale immediately" half of SWR.
 */
export function getPageCache(
  page: number,
  limit: number,
  name?: string,
): PaginatedResponse<Member> | null {
  return _pages.get(pageKey(page, limit, name))?.data ?? null;
}

/**
 * Returns true when the cached entry is still within TTL
 * (no revalidation needed).
 */
export function isPageCacheFresh(
  page: number,
  limit: number,
  name?: string,
): boolean {
  const entry = _pages.get(pageKey(page, limit, name));
  return !!entry && Date.now() - entry.ts < PAGE_TTL;
}

/**
 * Fetch page from network, populate cache, return data.
 * Does NOT check TTL — always makes a network request.
 * Call only when you want to revalidate.
 */
export async function revalidatePage(
  page: number,
  limit: number,
  name?: string,
): Promise<PaginatedResponse<Member>> {
  const res = await getMembersPage(page, limit, name);
  evictIfNeeded();
  _pages.set(pageKey(page, limit, name), { data: res.data, ts: Date.now() });
  return res.data;
}

// ── Shared invalidation ──────────────────────────────────────────────────────

/** Clear all caches (call after any create / update / delete / recalculate). */
export function invalidateMembersCache(): void {
  _full = null;
  _pages.clear();
}
