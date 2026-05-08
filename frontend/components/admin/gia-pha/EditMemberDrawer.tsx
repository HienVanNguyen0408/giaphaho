'use client';

import { useEffect, useState } from 'react';
import type React from 'react';
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
  const [drawerWidth, setDrawerWidth] = useState(720);

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

  const startResize = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const handleMove = (moveEvent: MouseEvent) => {
      const nextWidth = window.innerWidth - moveEvent.clientX;
      setDrawerWidth(Math.min(Math.max(nextWidth, 520), Math.min(window.innerWidth - 48, 1040)));
    };
    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[90] backdrop-blur-sm"
        style={{ background: 'color-mix(in oklch, var(--t-text) 24%, transparent)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed inset-y-0 right-0 z-[100] flex w-full flex-col"
        style={{
          width: `min(100vw, ${drawerWidth}px)`,
          background: 'var(--t-bg)',
          borderLeft: '1px solid var(--t-border)',
          boxShadow: '-24px 0 70px color-mix(in oklch, var(--t-text) 14%, transparent)',
        }}
      >
        <div
          onMouseDown={startResize}
          className="absolute inset-y-0 left-0 hidden w-2 -translate-x-1 cursor-ew-resize items-center justify-center lg:flex"
          title="Kéo để đổi độ rộng"
          aria-hidden="true"
        >
          <div
            className="h-16 w-1 rounded-full transition-colors"
            style={{ background: 'color-mix(in oklch, var(--t-accent) 32%, var(--t-border))' }}
          />
        </div>

        {/* Header */}
        <div
          className="flex flex-shrink-0 items-center justify-between px-6 py-4"
          style={{ background: 'var(--t-nav-active-bg)', borderBottom: '1px solid color-mix(in oklch, var(--t-nav-active-text) 10%, transparent)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ background: 'color-mix(in oklch, var(--t-nav-active-text) 14%, transparent)' }}
            >
              <svg className="h-4 w-4" style={{ color: 'var(--t-nav-active-text)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: 'var(--t-nav-active-text)' }}>Chỉnh sửa thành viên</h2>
              {initialData?.fullName && (
                <p className="mt-0.5 max-w-[360px] truncate text-xs" style={{ color: 'color-mix(in oklch, var(--t-nav-active-text) 76%, transparent)' }}>{initialData.fullName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            style={{ background: 'color-mix(in oklch, var(--t-nav-active-text) 14%, transparent)', color: 'var(--t-nav-active-text)' }}
            aria-label="Đóng"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ background: 'var(--t-bg)' }}>
          {loadError && (
            <div
              className="mb-5 flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
              style={{
                background: 'color-mix(in oklch, var(--t-error) 10%, var(--t-surface))',
                border: '1px solid color-mix(in oklch, var(--t-error) 22%, var(--t-border))',
                color: 'var(--t-error)',
              }}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {loadError}
            </div>
          )}

          {fetchLoading ? (
            <div className="space-y-5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl flex-shrink-0" style={{ background: 'var(--t-surface-2)' }} />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 w-20 rounded" style={{ background: 'var(--t-surface-2)' }} />
                  <div className="h-10 rounded-xl" style={{ background: 'var(--t-surface-2)' }} />
                </div>
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i}>
                  <div className="h-3 w-24 rounded mb-2" style={{ background: 'var(--t-surface-2)' }} />
                  <div className="h-10 rounded-xl" style={{ background: 'var(--t-surface-2)' }} />
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
