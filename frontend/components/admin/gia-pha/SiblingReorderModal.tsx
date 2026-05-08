'use client';

import { useState, useRef } from 'react';
import type { Member } from '@/types';
import { updateMember } from '@/lib/api';

interface Props {
  anchor: Member;
  siblings: Member[];
  onClose: () => void;
  onSaved: () => void;
}

function AvatarCircle({ member }: { member: Member }) {
  if (member.avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={member.avatar}
        alt={member.fullName}
        className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
        style={{ border: '1px solid var(--t-border)' }}
      />
    );
  }
  const initials = member.fullName
    .split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const colors = ['var(--t-accent)', 'var(--t-warning)', 'var(--t-info)', '#065f46', '#6d28d9'];
  const bg = colors[member.fullName.charCodeAt(0) % colors.length];
  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
      style={{ background: bg }}
    >
      {initials}
    </div>
  );
}

export default function SiblingReorderModal({ anchor, siblings, onClose, onSaved }: Props) {
  const [items, setItems] = useState<Member[]>(siblings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const dragIndex = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOver(index);
  };

  const handleDrop = (targetIndex: number) => {
    const from = dragIndex.current;
    if (from === null || from === targetIndex) {
      setDragOver(null);
      return;
    }
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(targetIndex, 0, moved);
    setItems(next);
    setDragOver(null);
    dragIndex.current = null;
  };

  const handleDragEnd = () => {
    dragIndex.current = null;
    setDragOver(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setItems(next);
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1) return;
    const next = [...items];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setItems(next);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await Promise.all(
        items.map((member, i) => updateMember(member.id, { siblingOrder: i + 1 }))
      );
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu thứ tự thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.45)' }}
        onClick={onClose}
      />
      <div
        className="relative flex flex-col w-full max-w-sm rounded-2xl shadow-2xl"
        style={{ background: 'var(--t-surface)', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--t-border)' }}
        >
          <div>
            <h2 className="text-[15px] font-semibold" style={{ color: 'var(--t-text)' }}>
              Sắp xếp thứ tự anh chị em
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--t-text-3)' }}>
              Kéo thả hoặc dùng nút ↑↓ · Trái nhất trong cây = vị trí 1
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: 'var(--t-text-3)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Siblings count */}
        <div
          className="px-5 py-2 text-xs"
          style={{ background: 'var(--t-surface-2)', borderBottom: '1px solid var(--t-border)', color: 'var(--t-text-3)' }}
        >
          {items.length} người cùng cha/mẹ
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {items.map((member, index) => {
            const isAnchor = member.id === anchor.id;
            const isDragTarget = dragOver === index;
            return (
              <div
                key={member.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all select-none"
                style={{
                  cursor: 'grab',
                  background: isDragTarget
                    ? 'color-mix(in oklch, var(--t-accent) 8%, var(--t-surface))'
                    : isAnchor
                    ? 'var(--t-surface-2)'
                    : 'var(--t-surface)',
                  borderColor: isDragTarget
                    ? 'var(--t-accent)'
                    : isAnchor
                    ? 'var(--t-border)'
                    : 'var(--t-border)',
                  opacity: dragIndex.current === index ? 0.5 : 1,
                }}
              >
                {/* Rank badge */}
                <span
                  className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full text-[11px] font-bold"
                  style={{
                    background: index === 0
                      ? 'color-mix(in oklch, var(--t-accent) 15%, transparent)'
                      : 'var(--t-surface-2)',
                    color: index === 0 ? 'var(--t-accent)' : 'var(--t-text-3)',
                  }}
                >
                  {index + 1}
                </span>

                {/* Avatar */}
                <AvatarCircle member={member} />

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--t-text)' }}>
                    {member.fullName}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--t-text-3)' }}>
                    {[
                      member.gender,
                      member.birthYear ? `sinh ${member.birthYear}` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>

                {/* Anchor badge */}
                {isAnchor && (
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      background: 'color-mix(in oklch, var(--t-accent) 12%, transparent)',
                      color: 'var(--t-accent)',
                    }}
                  >
                    đang chọn
                  </span>
                )}

                {/* Up/Down */}
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="w-5 h-5 flex items-center justify-center rounded transition-colors disabled:opacity-20"
                    style={{ color: 'var(--t-text-3)' }}
                    title="Lên trên"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === items.length - 1}
                    className="w-5 h-5 flex items-center justify-center rounded transition-colors disabled:opacity-20"
                    style={{ color: 'var(--t-text-3)' }}
                    title="Xuống dưới"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Drag handle */}
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: 'var(--t-text-3)' }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <circle cx="7" cy="6" r="1.2" />
                  <circle cx="13" cy="6" r="1.2" />
                  <circle cx="7" cy="10" r="1.2" />
                  <circle cx="13" cy="10" r="1.2" />
                  <circle cx="7" cy="14" r="1.2" />
                  <circle cx="13" cy="14" r="1.2" />
                </svg>
              </div>
            );
          })}
        </div>

        {error && (
          <p className="px-5 pb-2 text-xs" style={{ color: 'var(--t-error)' }}>
            {error}
          </p>
        )}

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-5 py-4"
          style={{ borderTop: '1px solid var(--t-border)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl border transition-colors"
            style={{
              background: 'var(--t-surface)',
              borderColor: 'var(--t-border)',
              color: 'var(--t-text-2)',
            }}
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-semibold rounded-xl transition-all disabled:opacity-60"
            style={{
              background: 'var(--t-accent)',
              color: 'var(--t-nav-active-text)',
            }}
          >
            {saving ? 'Đang lưu...' : 'Lưu thứ tự'}
          </button>
        </div>
      </div>
    </div>
  );
}
