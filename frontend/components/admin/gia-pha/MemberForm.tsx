'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { uploadFile } from '@/lib/api';
import type { Member } from '@/types';

interface MemberFormProps {
  initialData?: Partial<Member>;
  onSubmit: (data: Partial<Member>) => Promise<void>;
  loading?: boolean;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
        {children}
      </span>
      <div className="flex-1 h-px bg-stone-100" />
    </div>
  );
}

const inputCls =
  'w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-300 transition-colors text-stone-800 placeholder-stone-400';

export default function MemberForm({ initialData, onSubmit, loading = false }: MemberFormProps) {
  const [fullName, setFullName] = useState(initialData?.fullName ?? '');
  const [gender, setGender] = useState(initialData?.gender ?? '');
  const [birthYear, setBirthYear] = useState<string>(
    initialData?.birthYear != null ? String(initialData.birthYear) : '',
  );
  const [deathYear, setDeathYear] = useState<string>(
    initialData?.deathYear != null ? String(initialData.deathYear) : '',
  );
  const [bio, setBio] = useState(initialData?.bio ?? '');
  const [achievements, setAchievements] = useState<string[]>(initialData?.achievements ?? []);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialData?.avatar ?? null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [parentId, setParentId] = useState(initialData?.parentId ?? '');
  const [formError, setFormError] = useState<string | null>(null);

  const addAchievement = () => setAchievements((prev) => [...prev, '']);
  const updateAchievement = (idx: number, value: string) =>
    setAchievements((prev) => prev.map((a, i) => (i === idx ? value : a)));
  const removeAchievement = (idx: number) =>
    setAchievements((prev) => prev.filter((_, i) => i !== idx));

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const { url } = await uploadFile(file);
      setAvatarUrl(url);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Tải ảnh thất bại');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setFormError('Vui lòng nhập họ tên');
      return;
    }
    setFormError(null);
    const data: Partial<Member> = {
      fullName: fullName.trim(),
      gender: gender || null,
      birthYear: birthYear ? Number(birthYear) : null,
      deathYear: deathYear ? Number(deathYear) : null,
      bio: bio.trim() || null,
      achievements: achievements.filter((a) => a.trim()),
      avatar: avatarUrl,
      parentId: parentId.trim() || null,
    };
    try {
      await onSubmit(data);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Lưu thất bại');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {formError}
        </div>
      )}

      {/* ── Thông tin cơ bản ── */}
      <div>
        <SectionLabel>Thông tin cơ bản</SectionLabel>
        <div className="space-y-4">
          {/* Avatar + Full Name */}
          <div className="flex items-start gap-4">
            {/* Avatar preview */}
            <div className="flex-shrink-0">
              <div
                className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center relative"
                style={{ background: '#f5f0e8', border: '2px dashed #d1c4b0' }}
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-6 h-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
                {avatarUploading && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <span className="w-4 h-4 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <label className="mt-1.5 flex justify-center cursor-pointer">
                <span className="text-[10px] text-red-600 font-medium hover:text-red-700 transition-colors">
                  {avatarUrl ? 'Đổi ảnh' : 'Tải ảnh'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={avatarUploading}
                  className="sr-only"
                />
              </label>
            </div>

            {/* Name */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Nhập họ và tên đầy đủ"
                className={inputCls}
              />
            </div>
          </div>

          {/* Gender — button group */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Giới tính</label>
            <div className="flex gap-2">
              {['', 'Nam', 'Nữ'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all border"
                  style={
                    gender === g
                      ? { background: 'rgba(139,26,26,0.08)', color: '#8b1a1a', border: '1px solid rgba(139,26,26,0.25)' }
                      : { background: 'white', color: '#78716c', border: '1px solid #e7e5e4' }
                  }
                >
                  {g === '' ? 'Không rõ' : g}
                </button>
              ))}
            </div>
          </div>

          {/* Birth / Death year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">Năm sinh</label>
              <input
                type="number"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                placeholder="VD: 1950"
                min={1000}
                max={2100}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">Năm mất</label>
              <input
                type="number"
                value={deathYear}
                onChange={(e) => setDeathYear(e.target.value)}
                placeholder="Để trống nếu còn sống"
                min={1000}
                max={2100}
                className={inputCls}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Quan hệ ── */}
      <div>
        <SectionLabel>Quan hệ trong gia phả</SectionLabel>
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1.5">
            ID cha / mẹ
          </label>
          <input
            type="text"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            placeholder="ID của thành viên cha/mẹ (để trống nếu là gốc)"
            className={`${inputCls} font-mono text-xs`}
          />
          <p className="mt-1.5 text-[11px] text-stone-400">
            Nhập ID của cha hoặc mẹ để gán quan hệ trong cây gia phả
          </p>
        </div>
      </div>

      {/* ── Tiểu sử & thành tựu ── */}
      <div>
        <SectionLabel>Tiểu sử & Thành tựu</SectionLabel>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Tiểu sử</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Mô tả tiểu sử, cuộc đời..."
              className={`${inputCls} resize-none`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-600">Thành tựu</label>
              <button
                type="button"
                onClick={addAchievement}
                className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Thêm
              </button>
            </div>
            <div className="space-y-2">
              {achievements.map((a, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={a}
                    onChange={(e) => updateAchievement(idx, e.target.value)}
                    placeholder={`Thành tựu ${idx + 1}`}
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => removeAchievement(idx)}
                    className="px-2.5 py-2 text-stone-400 hover:text-red-600 transition-colors rounded-xl hover:bg-red-50 flex-shrink-0"
                    aria-label="Xóa"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {achievements.length === 0 && (
                <p className="text-xs text-stone-400 px-1 py-1">Chưa có thành tựu nào được thêm</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={loading || avatarUploading}
          className="w-full py-3 rounded-xl font-semibold text-sm tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #8b1a1a, #b45309)',
            color: '#fef3c7',
            boxShadow: '0 2px 16px rgba(139,26,26,0.2)',
          }}
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(254,243,199,0.3)', borderTopColor: '#fef3c7' }} />
              Đang lưu...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Lưu thành viên
            </>
          )}
        </button>
      </div>
    </form>
  );
}
