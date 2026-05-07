import type { Member } from '@/types';
import { getMembers } from './api';

const TTL = 5 * 60 * 1000; // 5 phút

let _cache: { data: Member[]; ts: number } | null = null;

export async function getCachedAllMembers(): Promise<Member[]> {
  if (_cache && Date.now() - _cache.ts < TTL) return _cache.data;
  const res = await getMembers();
  _cache = { data: res.data, ts: Date.now() };
  return _cache.data;
}

export function invalidateMembersCache(): void {
  _cache = null;
}
