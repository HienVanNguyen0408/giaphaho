'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getMember, getMembers, createMember, updateMember } from '@/lib/api';
import { invalidateMembersCache } from '@/lib/memberCache';
import MemberForm from '@/components/admin/gia-pha/MemberForm';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import type { Member } from '@/types';

function MemberEditContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const isNew = id === 'new';

  const [initialData, setInitialData] = useState<Partial<Member> | undefined>(undefined);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setFetchLoading(true);
      try {
        const membersRes = await getMembers();
        setAllMembers(membersRes.data);
        if (!isNew) {
          const memberRes = await getMember(id);
          setInitialData(memberRes.data);
        }
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Không thể tải dữ liệu');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchAll();
  }, [id, isNew]);

  const handleSubmit = async (data: Partial<Member>) => {
    setSaving(true);
    try {
      if (isNew) {
        await createMember(data);
      } else {
        await updateMember(id, data);
      }
      invalidateMembersCache();
      router.push('/admin/gia-pha');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-5xl space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/admin/gia-pha"
          className="flex items-center gap-1.5 font-medium transition-colors"
          style={{ color: 'color-mix(in oklch, var(--t-accent) 80%, transparent)' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Gia phả
        </Link>
        <span className="text-stone-300">/</span>
        <span className="text-stone-600 font-medium">
          {isNew ? 'Thêm thành viên' : 'Sửa thành viên'}
        </span>
      </nav>

      <AdminPageHeader
        title={isNew ? 'Thêm thành viên mới' : 'Chỉnh sửa thành viên'}
        eyebrow="Quản trị thành viên"
        description={
          isNew
            ? 'Điền thông tin thành viên và gán quan hệ trong gia phả.'
            : 'Cập nhật hồ sơ thành viên và quan hệ gia đình.'
        }
      />

      {/* Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Card header */}
        <div
          className="px-6 py-4 flex items-center gap-3"
          style={{ background: 'var(--t-surface-2)', borderBottom: '1px solid var(--t-border)' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--t-accent)' }}
          >
            <svg className="w-4 h-4 text-amber-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              {isNew ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              )}
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900">
              {isNew ? 'Thêm thành viên mới' : 'Chỉnh sửa thành viên'}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {isNew
                ? 'Điền đầy đủ thông tin để thêm vào gia phả'
                : 'Cập nhật thông tin và gán quan hệ cha–con'}
            </p>
          </div>
        </div>

        <div className="p-6">
          {loadError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {loadError}
            </div>
          )}

          {fetchLoading ? (
            <div className="space-y-5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-stone-100 flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 w-20 bg-stone-100 rounded" />
                  <div className="h-10 bg-stone-100 rounded-xl" />
                </div>
              </div>
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="h-3 w-24 bg-stone-100 rounded mb-2" />
                  <div className="h-10 bg-stone-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <MemberForm
              initialData={isNew ? undefined : initialData}
              members={allMembers}
              selfId={isNew ? undefined : id}
              onSubmit={handleSubmit}
              loading={saving}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function MemberEditPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto space-y-5 animate-pulse">
          <div className="h-5 w-32 bg-stone-200 rounded" />
          <div className="bg-white rounded-2xl h-96 border border-stone-200" />
        </div>
      }
    >
      <MemberEditContent />
    </Suspense>
  );
}
