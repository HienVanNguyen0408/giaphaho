'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getMember, createMember, updateMember } from '@/lib/api';
import MemberForm from '@/components/admin/gia-pha/MemberForm';
import type { Member } from '@/types';

function MemberEditContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const isNew = id === 'new';

  const [initialData, setInitialData] = useState<Partial<Member> | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fetchLoading, setFetchLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    setFetchLoading(true);
    getMember(id)
      .then((res) => setInitialData(res.data))
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Không thể tải dữ liệu'))
      .finally(() => setFetchLoading(false));
  }, [id, isNew]);

  const handleSubmit = async (data: Partial<Member>) => {
    setSaving(true);
    try {
      if (isNew) {
        await createMember(data);
      } else {
        await updateMember(id, data);
      }
      router.push('/admin/gia-pha');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-stone-500">
        <Link href="/admin/gia-pha" className="hover:text-stone-800 transition-colors">
          Gia phả
        </Link>
        <span>/</span>
        <span className="text-stone-800 font-medium">
          {isNew ? 'Thêm thành viên' : 'Sửa thành viên'}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
        <h1 className="text-xl font-bold text-stone-900 mb-6">
          {isNew ? 'Thêm thành viên mới' : 'Sửa thành viên'}
        </h1>

        {loadError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5">
            {loadError}
          </div>
        )}

        {fetchLoading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i}>
                <div className="h-3 w-20 bg-stone-100 rounded mb-2" />
                <div className="h-10 bg-stone-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <MemberForm
            initialData={isNew ? undefined : initialData}
            onSubmit={handleSubmit}
            loading={saving}
          />
        )}
      </div>
    </div>
  );
}

export default function MemberEditPage() {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-10 bg-stone-200 rounded w-1/4"></div><div className="h-64 bg-stone-200 rounded"></div></div>}>
      <MemberEditContent />
    </Suspense>
  );
}
