import type { Metadata } from 'next';
import Link from 'next/link';
import { cacheLife } from 'next/cache';
import { getMember } from '@/lib/api';
import { normalizeImageUrl } from '@/lib/imageUrl';
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
      <h2 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--t-text-3)' }}>{children}</h2>
      <div className="flex-1 h-px" style={{ background: 'var(--t-border)' }} />
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--t-bg)', color: 'var(--t-text-3)' }}>
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
    <div className="min-h-screen py-12 px-4" style={{ background: 'var(--t-bg)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href={`/gia-pha?active=${id}`}
          className="inline-flex items-center gap-2 text-sm transition-colors mb-8 group"
          style={{ color: 'var(--t-text-3)' }}
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Xem trong sơ đồ gia phả
        </Link>

        {/* Profile Card */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'var(--t-surface)',
            border: '1px solid var(--t-border)',
            boxShadow: '0 20px 60px color-mix(in oklch, var(--t-text) 8%, transparent)',
          }}
        >
          {/* Header */}
          <div
            className="px-8 py-10 flex flex-col sm:flex-row items-center gap-6"
            style={{
              background: 'var(--t-nav-active-bg)',
              color: 'var(--t-nav-active-text)',
              borderBottom: '1px solid color-mix(in oklch, var(--t-nav-active-text) 12%, transparent)',
            }}
          >
            <div className="flex-shrink-0">
              {member.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={normalizeImageUrl(member.avatar)}
                  alt={member.fullName}
                  className="w-28 h-28 rounded-full object-cover"
                  style={{ border: '4px solid color-mix(in oklch, var(--t-nav-active-text) 30%, transparent)' }}
                />
              ) : (
                <div
                  className="w-28 h-28 rounded-full flex items-center justify-center text-3xl font-bold"
                  style={{
                    background: 'color-mix(in oklch, var(--t-nav-active-text) 16%, transparent)',
                    border: '4px solid color-mix(in oklch, var(--t-nav-active-text) 30%, transparent)',
                    color: 'var(--t-nav-active-text)',
                  }}
                >
                  {member.fullName
                    .split(' ')
                    .slice(-2)
                    .map((w) => w[0])
                    .join('')}
                </div>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ color: 'var(--t-nav-active-text)' }}>
                {member.fullName}
              </h1>
              {years && <p className="mt-1 text-base" style={{ color: 'color-mix(in oklch, var(--t-nav-active-text) 78%, transparent)' }}>{years}</p>}
              <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                {member.gender && (
                  <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'color-mix(in oklch, var(--t-nav-active-text) 16%, transparent)', color: 'var(--t-nav-active-text)' }}>
                    {member.gender}
                  </span>
                )}
                {member.generation ? (
                  <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: 'color-mix(in oklch, var(--t-warning) 26%, transparent)', color: 'var(--t-nav-active-text)' }}>
                    Đời thứ {member.generation}
                  </span>
                ) : null}
                {(member.deathYear || member.deathDate) && (
                  <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'color-mix(in oklch, var(--t-text) 24%, transparent)', color: 'var(--t-nav-active-text)' }}>
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
                    <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'var(--t-surface-2)', border: '1px solid var(--t-border)' }}>
                      <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--t-text-3)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-xs w-20 flex-shrink-0" style={{ color: 'var(--t-text-3)' }}>Cha / Mẹ</span>
                      <Link
                        href={`/thanh-vien/${member.parent.id}`}
                        className="font-medium hover:underline text-sm"
                        style={{ color: 'var(--t-accent)' }}
                      >
                        {member.parent.fullName}
                      </Link>
                    </div>
                  )}

                  {/* Spouses */}
                  {member.spouses && member.spouses.length > 0 && (
                    <div className="rounded-xl px-4 py-3" style={{ background: 'var(--t-surface-2)', border: '1px solid var(--t-border)' }}>
                      <p className="text-xs mb-2 flex items-center gap-1" style={{ color: 'var(--t-text-3)' }}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Vợ / Chồng ({member.spouses.length})
                      </p>
                      <ul className="space-y-1.5">
                        {member.spouses.map((name, idx) => (
                          <li key={idx} className="flex items-center gap-3">
                            <span className="text-[10px] font-semibold w-20 flex-shrink-0 uppercase tracking-wide" style={{ color: 'var(--t-text-3)' }}>
                              {spouseOrdinal(idx, member.gender)}
                            </span>
                            <span className="text-sm font-medium" style={{ color: 'var(--t-text)' }}>{name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Children grouped by mother/branch */}
                  {member.children.length > 0 && (
                    <div className="rounded-xl px-4 py-3" style={{ background: 'var(--t-surface-2)', border: '1px solid var(--t-border)' }}>
                      <p className="text-xs mb-3 flex items-center gap-1" style={{ color: 'var(--t-text-3)' }}>
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
                                <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--t-accent)' }}>
                                  <span className="w-3 h-px inline-block" style={{ background: 'color-mix(in oklch, var(--t-accent) 34%, var(--t-border))' }} />
                                  Nhánh của {motherNameKey}
                                </p>
                              )}
                              {isLarge ? (
                                <details className="group">
                                  <summary className="cursor-pointer list-none flex items-center gap-2 text-xs transition-colors select-none mb-1.5" style={{ color: 'var(--t-text-3)' }}>
                                    <svg className="w-3.5 h-3.5 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                    {children.length} con — nhấn để xem toàn bộ nhánh
                                  </summary>
                                  <ul className="pl-5 space-y-1 mt-1">
                                    {children.map((c) => (
                                      <li key={c.id} className="flex items-center gap-2">
                                        <span className="text-xs" style={{ color: 'var(--t-text-3)' }}>
                                          {c.gender === 'Nam' ? '♂' : c.gender === 'Nữ' ? '♀' : '·'}
                                        </span>
                                        <Link
                                          href={`/thanh-vien/${c.id}`}
                                          className="text-sm hover:underline"
                                          style={{ color: 'var(--t-accent)' }}
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
                                      <span className="text-xs" style={{ color: 'var(--t-text-3)' }}>
                                        {c.gender === 'Nam' ? '♂' : c.gender === 'Nữ' ? '♀' : '·'}
                                      </span>
                                      <Link
                                        href={`/thanh-vien/${c.id}`}
                                        className="text-sm hover:underline"
                                        style={{ color: 'var(--t-accent)' }}
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
                <p className="leading-relaxed text-sm" style={{ color: 'var(--t-text-2)' }}>{member.bio}</p>
              </section>
            )}

            {/* ── Thành tựu cá nhân ── */}
            {member.achievements && member.achievements.length > 0 && (
              <section>
                <SectionHeading>Thành tựu cá nhân</SectionHeading>
                <ul className="space-y-2">
                  {member.achievements.map((a, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{
                          background: 'color-mix(in oklch, var(--t-warning) 14%, var(--t-surface))',
                          color: 'var(--t-warning)',
                        }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-sm" style={{ color: 'var(--t-text-2)' }}>{a}</span>
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
                      <span
                        className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{
                          background: 'color-mix(in oklch, var(--t-success) 14%, var(--t-surface))',
                          color: 'var(--t-success)',
                        }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-sm" style={{ color: 'var(--t-text-2)' }}>{c}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* ── Ngày mất & Nơi an táng ── */}
            {member.deathYear || member.deathDate || member.burialPlace ? (
              <section>
                <SectionHeading>Thông tin khi mất</SectionHeading>
                <div className="rounded-xl px-4 py-3 space-y-2" style={{ background: 'var(--t-surface-2)', border: '1px solid var(--t-border)' }}>
                  {(member.deathYear || member.deathDate) && (
                    <div className="flex gap-3 text-sm">
                      <span className="w-24 flex-shrink-0" style={{ color: 'var(--t-text-3)' }}>Ngày mất</span>
                      <span className="capitalize" style={{ color: 'var(--t-text-2)' }}>
                        {member.deathDate
                          ? formatDayMonth(member.deathDate) ?? member.deathDate
                          : member.deathYear}
                      </span>
                    </div>
                  )}
                  {(member.birthYear || member.birthDate) && (
                    <div className="flex gap-3 text-sm">
                      <span className="w-24 flex-shrink-0" style={{ color: 'var(--t-text-3)' }}>Ngày sinh</span>
                      <span className="capitalize" style={{ color: 'var(--t-text-2)' }}>
                        {member.birthDate
                          ? formatDayMonth(member.birthDate) ?? member.birthDate
                          : member.birthYear}
                      </span>
                    </div>
                  )}
                  {member.burialPlace && (
                    <div className="flex gap-3 text-sm">
                      <span className="w-24 flex-shrink-0" style={{ color: 'var(--t-text-3)' }}>Nơi an táng</span>
                      <span style={{ color: 'var(--t-text-2)' }}>{member.burialPlace}</span>
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
