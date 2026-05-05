import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { cacheLife } from 'next/cache';
import { getMember } from '@/lib/api';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getMemberData(id: string) {
  'use cache';
  cacheLife('hours');
  try {
    const res = await getMember(id);
    return res.data;
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

export default async function MemberPage({ params }: PageProps) {
  const { id } = await params;
  const member = await getMemberData(id);
  if (!member) return <div className="min-h-screen flex items-center justify-center text-stone-400">Không tìm thấy thành viên hoặc không thể kết nối. Vui lòng thử lại sau.</div>;

  const genderLabel =
    member.gender === 'MALE' ? 'Nam' : member.gender === 'FEMALE' ? 'Nữ' : member.gender;
  const years =
    member.birthYear || member.deathYear
      ? `${member.birthYear ?? '?'} – ${member.deathYear ?? 'nay'}`
      : null;

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href="/gia-pha"
          className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-red-700 transition-colors mb-8 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Quay lại sơ đồ gia phả
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
              {years && (
                <p className="text-amber-200 mt-1 text-base">{years}</p>
              )}
              {genderLabel && (
                <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-white/20 text-white">
                  {genderLabel}
                </span>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-8 space-y-8">
            {/* Relations */}
            {(member.parent || member.children.length > 0) && (
              <section>
                <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">
                  Quan hệ gia đình
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {member.parent && (
                    <div className="bg-stone-50 rounded-xl p-4">
                      <p className="text-xs text-stone-400 mb-1">Cha / Mẹ</p>
                      <Link
                        href={`/thanh-vien/${member.parent.id}`}
                        className="font-medium text-red-700 hover:underline"
                      >
                        {member.parent.fullName}
                      </Link>
                    </div>
                  )}
                  {member.children.length > 0 && (
                    <div className="bg-stone-50 rounded-xl p-4 sm:col-span-1">
                      <p className="text-xs text-stone-400 mb-2">Con cái ({member.children.length})</p>
                      <ul className="space-y-1">
                        {member.children.map((c) => (
                          <li key={c.id}>
                            <Link
                              href={`/thanh-vien/${c.id}`}
                              className="text-sm text-red-700 hover:underline"
                            >
                              {c.fullName}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Bio */}
            {member.bio && (
              <section>
                <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">
                  Tiểu sử
                </h2>
                <p className="text-stone-700 leading-relaxed text-sm">{member.bio}</p>
              </section>
            )}

            {/* Achievements */}
            {member.achievements.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">
                  Thành tích & đóng góp
                </h2>
                <ul className="space-y-2">
                  {member.achievements.map((a, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-sm text-stone-700">{a}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
