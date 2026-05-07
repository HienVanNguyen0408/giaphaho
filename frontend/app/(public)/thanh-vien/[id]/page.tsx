import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { cacheLife } from 'next/cache';
import { getMember } from '@/lib/api';
import type { MemberDetail } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getMemberData(id: string) {
  'use cache';
  cacheLife('hours');
  try {
    const res = await getMember(id);
    return res.data as MemberDetail;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const member = await getMemberData(id);
    if (!member) return { title: 'Thành viên' };
    return {
      title: member.fullName,
      description: member.bio ?? `Trang thành viên ${member.fullName} — Gia Phả Họ Phùng Bát Tràng`,
    };
  } catch {
    return { title: 'Thành viên' };
  }
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{children}</h2>
      <div className="flex-1 h-px bg-stone-100" />
    </div>
  );
}

function formatDayMonth(str: string | null | undefined): string | null {
  if (!str) return null;
  const parts = str.split('/');
  if (parts.length === 2 && parts[0] && parts[1]) {
    return `ngày ${parts[0]} tháng ${parts[1]}`;
  }
  return str;
}

const SPOUSE_ORDINALS = ['cả', 'hai', 'ba', 'tư', 'năm', 'sáu', 'bảy', 'tám', 'chín', 'mười'];

function spouseOrdinal(idx: number, gender: string | null) {
  const ord = SPOUSE_ORDINALS[idx] ?? `${idx + 1}`;
  if (gender === 'Nữ') return `Chồng ${ord}`;
  return `Vợ ${ord}`;
}

export default async function MemberPage({ params }: PageProps) {
  const { id } = await params;
  const member = await getMemberData(id);
  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-400">
        Không tìm thấy thành viên hoặc không thể kết nối. Vui lòng thử lại sau.
      </div>
    );
  }

  // Build lifespan string: prefer year range, fall back to day/month
  const years = (() => {
    if (member.birthYear || member.deathYear) {
      return `${member.birthYear ?? '?'} – ${member.deathYear ?? 'nay'}`;
    }
    const birth = formatDayMonth(member.birthDate);
    const death = formatDayMonth(member.deathDate);
    if (birth && death) return `${birth} – mất ${death}`;
    if (death) return `Mất ${death}`;
    if (birth) return `Sinh ${birth}`;
    return null;
  })();

  // Group children by motherName
  const childrenByMother = new Map<string | null, typeof member.children>();
  for (const child of member.children) {
    const key = child.motherName ?? null;
    if (!childrenByMother.has(key)) childrenByMother.set(key, []);
    childrenByMother.get(key)!.push(child);
  }
  const motherGroups = Array.from(childrenByMother.entries());
  // null group (no motherName) first, named groups after
  motherGroups.sort(([a], [b]) => {
    if (a === null) return -1;
    if (b === null) return 1;
    return a.localeCompare(b, 'vi');
  });

  const hasFamilyRelations =
    member.parent ||
    (member.spouses && member.spouses.length > 0) ||
    member.children.length > 0;

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href={`/gia-pha?active=${id}`}
          className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-red-700 transition-colors mb-8 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Xem trong sơ đồ gia phả
        </Link>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Header gradient */}
          <div className="bg-gradient-to-r from-red-800 to-amber-700 px-8 py-10 flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              {member.avatar ? (
                <Image
                  src={member.avatar}
                  alt={member.fullName}
                  width={112}
                  height={112}
                  className="w-28 h-28 rounded-full object-cover border-4 border-white/30 shadow-lg"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {member.fullName
                    .split(' ')
                    .slice(-2)
                    .map((w) => w[0])
                    .join('')}
                </div>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                {member.fullName}
              </h1>
              {years && <p className="text-amber-200 mt-1 text-base">{years}</p>}
              <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                {member.gender && (
                  <span className="text-xs px-3 py-1 rounded-full bg-white/20 text-white">
                    {member.gender}
                  </span>
                )}
                {member.generation ? (
                  <span className="text-xs px-3 py-1 rounded-full bg-amber-400/30 text-amber-100 font-semibold">
                    Đời thứ {member.generation}
                  </span>
                ) : null}
                {(member.deathYear || member.deathDate) && (
                  <span className="text-xs px-3 py-1 rounded-full bg-stone-800/40 text-stone-200">
                    ✝ Đã mất
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-8 space-y-8">

            {/* ── Quan hệ gia đình ── */}
            {hasFamilyRelations && (
              <section>
                <SectionHeading>Quan hệ gia đình</SectionHeading>
                <div className="space-y-4">

                  {/* Parent */}
                  {member.parent && (
                    <div className="flex items-center gap-3 bg-stone-50 rounded-xl px-4 py-3">
                      <svg className="w-4 h-4 text-stone-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-xs text-stone-400 w-20 flex-shrink-0">Cha / Mẹ</span>
                      <Link
                        href={`/thanh-vien/${member.parent.id}`}
                        className="font-medium text-red-700 hover:underline text-sm"
                      >
                        {member.parent.fullName}
                      </Link>
                    </div>
                  )}

                  {/* Spouses */}
                  {member.spouses && member.spouses.length > 0 && (
                    <div className="bg-stone-50 rounded-xl px-4 py-3">
                      <p className="text-xs text-stone-400 mb-2 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Vợ / Chồng ({member.spouses.length})
                      </p>
                      <ul className="space-y-1.5">
                        {member.spouses.map((name, idx) => (
                          <li key={idx} className="flex items-center gap-3">
                            <span className="text-[10px] font-semibold text-stone-400 w-20 flex-shrink-0 uppercase tracking-wide">
                              {spouseOrdinal(idx, member.gender)}
                            </span>
                            <span className="text-sm font-medium text-stone-800">{name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Children grouped by mother/branch */}
                  {member.children.length > 0 && (
                    <div className="bg-stone-50 rounded-xl px-4 py-3">
                      <p className="text-xs text-stone-400 mb-3 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Con cái ({member.children.length})
                      </p>
                      <div className="space-y-3">
                        {motherGroups.map(([motherNameKey, children]) => {
                          const isLarge = children.length > 5;
                          return (
                            <div key={motherNameKey ?? '__none__'}>
                              {motherNameKey && (
                                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-1.5 flex items-center gap-1.5">
                                  <span className="w-3 h-px bg-amber-300 inline-block" />
                                  Nhánh của {motherNameKey}
                                </p>
                              )}
                              {isLarge ? (
                                <details className="group">
                                  <summary className="cursor-pointer list-none flex items-center gap-2 text-xs text-stone-500 hover:text-red-700 transition-colors select-none mb-1.5">
                                    <svg className="w-3.5 h-3.5 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                    {children.length} con — nhấn để xem toàn bộ nhánh
                                  </summary>
                                  <ul className="pl-5 space-y-1 mt-1">
                                    {children.map((c) => (
                                      <li key={c.id} className="flex items-center gap-2">
                                        <span className="text-stone-300 text-xs">
                                          {c.gender === 'Nam' ? '♂' : c.gender === 'Nữ' ? '♀' : '·'}
                                        </span>
                                        <Link
                                          href={`/thanh-vien/${c.id}`}
                                          className="text-sm text-red-700 hover:underline"
                                        >
                                          {c.fullName}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </details>
                              ) : (
                                <ul className="space-y-1">
                                  {children.map((c) => (
                                    <li key={c.id} className="flex items-center gap-2">
                                      <span className="text-stone-300 text-xs">
                                        {c.gender === 'Nam' ? '♂' : c.gender === 'Nữ' ? '♀' : '·'}
                                      </span>
                                      <Link
                                        href={`/thanh-vien/${c.id}`}
                                        className="text-sm text-red-700 hover:underline"
                                      >
                                        {c.fullName}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ── Tiểu sử ── */}
            {member.bio && (
              <section>
                <SectionHeading>Tiểu sử</SectionHeading>
                <p className="text-stone-700 leading-relaxed text-sm">{member.bio}</p>
              </section>
            )}

            {/* ── Thành tựu cá nhân ── */}
            {member.achievements && member.achievements.length > 0 && (
              <section>
                <SectionHeading>Thành tựu cá nhân</SectionHeading>
                <ul className="space-y-2">
                  {member.achievements.map((a, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold">
                        {i + 1}
                      </span>
                      <span className="text-sm text-stone-700">{a}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* ── Đóng góp cho gia tộc ── */}
            {member.contributions && member.contributions.length > 0 && (
              <section>
                <SectionHeading>Đóng góp cho gia tộc</SectionHeading>
                <ul className="space-y-2">
                  {member.contributions.map((c, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                        {i + 1}
                      </span>
                      <span className="text-sm text-stone-700">{c}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* ── Ngày mất & Nơi an táng ── */}
            {member.deathYear || member.deathDate || member.burialPlace ? (
              <section>
                <SectionHeading>Thông tin khi mất</SectionHeading>
                <div className="bg-stone-50 rounded-xl px-4 py-3 space-y-2">
                  {(member.deathYear || member.deathDate) && (
                    <div className="flex gap-3 text-sm">
                      <span className="text-stone-400 w-24 flex-shrink-0">Ngày mất</span>
                      <span className="text-stone-700 capitalize">
                        {member.deathDate
                          ? formatDayMonth(member.deathDate) ?? member.deathDate
                          : member.deathYear}
                      </span>
                    </div>
                  )}
                  {(member.birthYear || member.birthDate) && (
                    <div className="flex gap-3 text-sm">
                      <span className="text-stone-400 w-24 flex-shrink-0">Ngày sinh</span>
                      <span className="text-stone-700 capitalize">
                        {member.birthDate
                          ? formatDayMonth(member.birthDate) ?? member.birthDate
                          : member.birthYear}
                      </span>
                    </div>
                  )}
                  {member.burialPlace && (
                    <div className="flex gap-3 text-sm">
                      <span className="text-stone-400 w-24 flex-shrink-0">Nơi an táng</span>
                      <span className="text-stone-700">{member.burialPlace}</span>
                    </div>
                  )}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
