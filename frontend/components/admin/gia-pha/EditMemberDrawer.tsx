'use client';

import { useEffect, useState } from 'react';
import { getMember, getMembers, updateMember } from '@/lib/api';
import { invalidateMembersCache } from '@/lib/memberCache';
import MemberForm from './MemberForm';
import type { Member } from '@/types';

interface EditMemberDrawerProps {
  memberId: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditMemberDrawer({ memberId, onClose, onSaved }: EditMemberDrawerProps) {
  const [initialData, setInitialData] = useState<Partial<Member> | undefined>(undefined);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFetchLoading(true);
    setLoadError(null);
    Promise.all([getMember(memberId), getMembers()])
      .then(([memberRes, membersRes]) => {
        setInitialData(memberRes.data);
        setAllMembers(membersRes.data);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Không thể tải dữ liệu'))
      .finally(() => setFetchLoading(false));
  }, [memberId]);

  const handleSubmit = async (data: Partial<Member>) => {
    setSaving(true);
    try {
      await updateMember(memberId, data);
      invalidateMembersCache();
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg flex flex-col bg-white shadow-2xl">
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #8b1a1a, #b45309)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-amber-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Chỉnh sửa thành viên</h2>
              {initialData?.fullName && (
                <p className="text-xs text-amber-200 mt-0.5 truncate max-w-[240px]">{initialData.fullName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
            aria-label="Đóng"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
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
              {[...Array(5)].map((_, i) => (
                <div key={i}>
                  <div className="h-3 w-24 bg-stone-100 rounded mb-2" />
                  <div className="h-10 bg-stone-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : !loadError && initialData ? (
            <MemberForm
              initialData={initialData}
              members={allMembers}
              selfId={memberId}
              onSubmit={handleSubmit}
              loading={saving}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
