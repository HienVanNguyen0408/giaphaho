'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { uploadFile } from '@/lib/api';
import type { Member } from '@/types';

interface MemberFormProps {
  initialData?: Partial<Member>;
  onSubmit: (data: Partial<Member>) => Promise<void>;
  loading?: boolean;
}

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
  const [achievements, setAchievements] = useState<string[]>(
    initialData?.achievements ?? [],
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialData?.avatar ?? null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [parentId, setParentId] = useState(initialData?.parentId ?? '');
  const [formError, setFormError] = useState<string | null>(null);

  // Achievements helpers
  const addAchievement = () => setAchievements((prev) => [...prev, '']);
  const updateAchievement = (idx: number, value: string) => {
    setAchievements((prev) => prev.map((a, i) => (i === idx ? value : a)));
  };
  const removeAchievement = (idx: number) => {
    setAchievements((prev) => prev.filter((_, i) => i !== idx));
  };

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
    <form onSubmit={handleSubmit} className="space-y-5">
      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {formError}
        </div>
      )}

      {/* Full name */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Họ tên <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          placeholder="Nhập họ và tên"
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
        />
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Giới tính</label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors bg-white"
        >
          <option value="">Không rõ</option>
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
        </select>
      </div>

      {/* Birth / Death year */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Năm sinh</label>
          <input
            type="number"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            placeholder="VD: 1950"
            min={1000}
            max={2100}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Năm mất</label>
          <input
            type="number"
            value={deathYear}
            onChange={(e) => setDeathYear(e.target.value)}
            placeholder="VD: 2020"
            min={1000}
            max={2100}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
          />
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Tiểu sử</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder="Mô tả tiểu sử..."
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors resize-none"
        />
      </div>

      {/* Achievements */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-stone-700">Thành tựu</label>
          <button
            type="button"
            onClick={addAchievement}
            className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            + Thêm
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
                className="flex-1 px-4 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => removeAchievement(idx)}
                className="px-3 py-2 text-stone-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                aria-label="Xóa thành tựu"
              >
                ✕
              </button>
            </div>
          ))}
          {achievements.length === 0 && (
            <p className="text-xs text-stone-400 px-1">Chưa có thành tựu nào</p>
          )}
        </div>
      </div>

      {/* Avatar */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Ảnh đại diện</label>
        <div className="flex items-center gap-4">
          {avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt="Preview"
              className="w-16 h-16 rounded-xl object-cover border border-stone-200"
            />
          )}
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={avatarUploading}
              className="w-full text-sm text-stone-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 transition-colors"
            />
            {avatarUploading && (
              <p className="text-xs text-stone-400 mt-1">Đang tải ảnh...</p>
            )}
          </div>
        </div>
      </div>

      {/* Parent ID */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          ID cha/mẹ
        </label>
        <input
          type="text"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          placeholder="ID của thành viên cha/mẹ (để trống nếu là gốc)"
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors font-mono"
        />
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading || avatarUploading}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 text-white font-semibold text-sm hover:from-red-800 hover:to-amber-700 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Đang lưu...' : 'Lưu thành viên'}
        </button>
      </div>
    </form>
  );
}
