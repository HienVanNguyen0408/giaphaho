'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { uploadFile } from '@/lib/api';
import type { Member, FieldConfig } from '@/types';

interface MemberFormProps {
  initialData?: Partial<Member>;
  members?: Member[];
  selfId?: string;
  onSubmit: (data: Partial<Member>) => Promise<void>;
  loading?: boolean;
}

function SectionLabel({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
        {children}
      </span>
      <div className="flex-1 h-px bg-stone-100" />
      {action}
    </div>
  );
}

const inputCls =
  'w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-300 transition-colors text-stone-800 placeholder-stone-400';

function EyeToggle({ visible, onToggle, label }: { visible: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={visible ? `Ẩn ${label} khỏi hồ sơ công khai` : `Hiện ${label} trong hồ sơ công khai`}
      className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-stone-100"
    >
      {visible ? (
        <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      )}
    </button>
  );
}

const OPTIONAL_FIELDS = [
  { key: 'birthDate' as const, label: 'Ngày tháng năm sinh', placeholder: 'Ngày sinh đầy đủ', type: 'date' },
  { key: 'residence' as const, label: 'Nơi sống', placeholder: 'Địa chỉ nơi sinh sống', type: 'text' },
  { key: 'nationalId' as const, label: 'Số CCCD', placeholder: 'Số căn cước công dân', type: 'text' },
  { key: 'phone' as const, label: 'Số điện thoại', placeholder: 'Số điện thoại liên lạc', type: 'tel' },
  { key: 'email' as const, label: 'Địa chỉ Email', placeholder: 'Địa chỉ email', type: 'email' },
  { key: 'bankAccount' as const, label: 'Số tài khoản ngân hàng', placeholder: 'Số tài khoản ngân hàng', type: 'text' },
] as const;

type OptionalFieldKey = (typeof OPTIONAL_FIELDS)[number]['key'];

export default function MemberForm({
  initialData,
  members = [],
  selfId,
  onSubmit,
  loading = false,
}: MemberFormProps) {
  const [fullName, setFullName] = useState(initialData?.fullName ?? '');
  const [gender, setGender] = useState(initialData?.gender ?? '');
  const [isDeceased, setIsDeceased] = useState(
    !!(initialData?.deathYear || initialData?.deathDate),
  );
  const [birthYear, setBirthYear] = useState<string>(
    initialData?.birthYear != null ? String(initialData.birthYear) : '',
  );
  const [deathYear, setDeathYear] = useState<string>(
    initialData?.deathYear != null ? String(initialData.deathYear) : '',
  );
  const [deathDate, setDeathDate] = useState<string>(initialData?.deathDate ?? '');
  const [bio, setBio] = useState(initialData?.bio ?? '');
  const [achievements, setAchievements] = useState<string[]>(initialData?.achievements ?? []);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialData?.avatar ?? null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [parentId, setParentId] = useState(initialData?.parentId ?? '');
  const [parentSearch, setParentSearch] = useState('');
  const [showParentDropdown, setShowParentDropdown] = useState(false);
  const [spouses, setSpouses] = useState<string[]>(initialData?.spouses ?? []);
  const [motherName, setMotherName] = useState(initialData?.motherName ?? '');
  const [contributions, setContributions] = useState<string[]>(initialData?.contributions ?? []);
  const [formError, setFormError] = useState<string | null>(null);

  // Optional fields values
  const [optionalValues, setOptionalValues] = useState<Record<OptionalFieldKey, string>>({
    birthDate: initialData?.birthDate ?? '',
    residence: initialData?.residence ?? '',
    nationalId: initialData?.nationalId ?? '',
    phone: initialData?.phone ?? '',
    email: initialData?.email ?? '',
    bankAccount: initialData?.bankAccount ?? '',
  });

  // Burial place (for deceased)
  const [burialPlace, setBurialPlace] = useState(initialData?.burialPlace ?? '');

  // Field public visibility config
  const [fieldConfig, setFieldConfig] = useState<FieldConfig>(
    (initialData?.fieldConfig as FieldConfig) ?? {},
  );

  // Determine which optional fields are "active" (have data or were activated)
  const [showOptionalSection, setShowOptionalSection] = useState(() => {
    return OPTIONAL_FIELDS.some((f) => !!(initialData as Record<string, unknown>)?.[f.key]);
  });

  const toggleFieldVisibility = (key: OptionalFieldKey) => {
    setFieldConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const setOptionalValue = (key: OptionalFieldKey, value: string) => {
    setOptionalValues((prev) => ({ ...prev, [key]: value }));
  };

  const addAchievement = () => setAchievements((prev) => [...prev, '']);
  const updateAchievement = (idx: number, value: string) =>
    setAchievements((prev) => prev.map((a, i) => (i === idx ? value : a)));
  const removeAchievement = (idx: number) =>
    setAchievements((prev) => prev.filter((_, i) => i !== idx));

  const addSpouse = () => setSpouses((prev) => [...prev, '']);
  const updateSpouse = (idx: number, value: string) =>
    setSpouses((prev) => prev.map((s, i) => (i === idx ? value : s)));
  const removeSpouse = (idx: number) =>
    setSpouses((prev) => prev.filter((_, i) => i !== idx));

  const addContribution = () => setContributions((prev) => [...prev, '']);
  const updateContribution = (idx: number, value: string) =>
    setContributions((prev) => prev.map((c, i) => (i === idx ? value : c)));
  const removeContribution = (idx: number) =>
    setContributions((prev) => prev.filter((_, i) => i !== idx));

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

  const availableParents = members.filter((m) => m.id !== selfId);
  const selectedParent = availableParents.find((m) => m.id === parentId);
  const filteredParents = parentSearch.trim()
    ? availableParents.filter((m) =>
        m.fullName.toLowerCase().includes(parentSearch.toLowerCase()),
      )
    : availableParents.slice(0, 20);

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
      birthDate: optionalValues.birthDate || null,
      deathYear: isDeceased && deathYear ? Number(deathYear) : null,
      deathDate: isDeceased ? deathDate || null : null,
      bio: bio.trim() || null,
      achievements: achievements.filter((a) => a.trim()),
      contributions: contributions.filter((c) => c.trim()),
      avatar: avatarUrl,
      parentId: parentId.trim() || null,
      spouses: spouses.filter((s) => s.trim()),
      motherName: motherName.trim() || null,
      residence: optionalValues.residence || null,
      nationalId: optionalValues.nationalId || null,
      phone: optionalValues.phone || null,
      email: optionalValues.email || null,
      bankAccount: optionalValues.bankAccount || null,
      burialPlace: isDeceased ? burialPlace || null : null,
      fieldConfig: fieldConfig,
    };
    try {
      await onSubmit(data);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Lưu thất bại');
    }
  };

  const hasStats =
    initialData?.generation != null ||
    initialData?.siblingsCount != null ||
    initialData?.sonsCount != null ||
    initialData?.daughtersCount != null ||
    initialData?.descendantsCount != null;

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
            <div className="flex-shrink-0">
              <div
                className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center relative"
                style={{ background: '#f5f0e8', border: '2px dashed #d1c4b0' }}
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-7 h-7 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

              {/* Birth year (compact, always visible) */}
              <div className="mt-3">
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
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Giới tính</label>
            <div className="flex gap-2">
              {[
                { value: 'Nam', icon: '♂', color: 'rgba(59,130,246,0.08)', active: 'rgba(59,130,246,0.12)', text: '#2563eb' },
                { value: 'Nữ', icon: '♀', color: 'rgba(236,72,153,0.08)', active: 'rgba(236,72,153,0.12)', text: '#db2777' },
              ].map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGender(gender === g.value ? '' : g.value)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border"
                  style={
                    gender === g.value
                      ? { background: g.active, color: g.text, border: `1px solid ${g.text}40` }
                      : { background: 'white', color: '#78716c', border: '1px solid #e7e5e4' }
                  }
                >
                  <span className="text-base leading-none">{g.icon}</span>
                  {g.value}
                </button>
              ))}
              {gender && (
                <button
                  type="button"
                  onClick={() => setGender('')}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-stone-600 transition-colors border border-stone-200 hover:border-stone-300"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>

          {/* Status: Còn sống / Đã mất */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Tình trạng</label>
            <div className="flex rounded-xl border border-stone-200 overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setIsDeceased(false)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all"
                style={
                  !isDeceased
                    ? { background: 'rgba(16,185,129,0.1)', color: '#059669' }
                    : { color: '#a8a29e' }
                }
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: !isDeceased ? '#10b981' : '#d6d3d1' }} />
                Còn sống
              </button>
              <div className="w-px bg-stone-200" />
              <button
                type="button"
                onClick={() => setIsDeceased(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all"
                style={
                  isDeceased
                    ? { background: 'rgba(120,113,108,0.08)', color: '#57534e' }
                    : { color: '#a8a29e' }
                }
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: isDeceased ? '#78716c' : '#d6d3d1' }} />
                Đã mất
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Nếu đã mất ── */}
      {isDeceased && (
        <div>
          <SectionLabel>Thông tin khi mất</SectionLabel>
          <div className="space-y-4 bg-stone-50 rounded-xl p-4 border border-stone-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Năm mất</label>
                <input
                  type="number"
                  value={deathYear}
                  onChange={(e) => setDeathYear(e.target.value)}
                  placeholder="VD: 2020"
                  min={1000}
                  max={2100}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Ngày mất</label>
                <input
                  type="date"
                  value={deathDate}
                  onChange={(e) => setDeathDate(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">Nơi an táng</label>
              <input
                type="text"
                value={burialPlace}
                onChange={(e) => setBurialPlace(e.target.value)}
                placeholder="Tên nghĩa trang hoặc địa điểm an táng"
                className={inputCls}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Thông tin bổ sung (expandable with hidden button) ── */}
      <div>
        <SectionLabel
          action={
            <button
              type="button"
              onClick={() => setShowOptionalSection((v) => !v)}
              className="flex items-center gap-1 text-[10px] font-semibold text-stone-400 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
              title={showOptionalSection ? 'Thu gọn thông tin bổ sung' : 'Thêm thông tin bổ sung'}
            >
              {showOptionalSection ? (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                  Thu gọn
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Thêm thông tin
                </>
              )}
            </button>
          }
        >
          Thông tin bổ sung
        </SectionLabel>

        {showOptionalSection && (
          <div className="space-y-3">
            <p className="text-[11px] text-stone-400 -mt-2 mb-1">
              Nhấn biểu tượng mắt để bật/tắt hiển thị trong hồ sơ công khai.
            </p>
            {OPTIONAL_FIELDS.map((field) => (
              <div key={field.key} className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={optionalValues[field.key]}
                    onChange={(e) => setOptionalValue(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className={inputCls}
                  />
                </div>
                <div className="pt-6">
                  <EyeToggle
                    visible={!!fieldConfig[field.key]}
                    onToggle={() => toggleFieldVisibility(field.key)}
                    label={field.label}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {!showOptionalSection && (
          <p className="text-[11px] text-stone-400 -mt-2">
            {OPTIONAL_FIELDS.filter((f) => optionalValues[f.key]).length > 0
              ? `${OPTIONAL_FIELDS.filter((f) => optionalValues[f.key]).length} trường đã có dữ liệu`
              : 'Chưa thêm thông tin bổ sung'}
          </p>
        )}
      </div>

      {/* ── Quan hệ ── */}
      <div>
        <SectionLabel>Quan hệ trong gia phả</SectionLabel>
        <div className="space-y-4">
          {/* Parent selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">
              Cha / Mẹ
            </label>
            {members.length > 0 ? (
              <div className="relative">
                <div
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm bg-white cursor-pointer flex items-center justify-between hover:border-red-400 transition-colors"
                  onClick={() => setShowParentDropdown((v) => !v)}
                >
                  {selectedParent ? (
                    <span className="text-stone-800 font-medium">{selectedParent.fullName}</span>
                  ) : (
                    <span className="text-stone-400">Không có (gốc gia phả)</span>
                  )}
                  <svg className="w-4 h-4 text-stone-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {showParentDropdown && (
                  <div className="absolute top-full mt-1 w-full bg-white border border-stone-200 rounded-xl shadow-xl z-20 overflow-hidden">
                    <div className="p-2 border-b border-stone-100">
                      <input
                        type="text"
                        value={parentSearch}
                        onChange={(e) => setParentSearch(e.target.value)}
                        placeholder="Tìm theo tên..."
                        className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-red-400"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <ul className="max-h-52 overflow-y-auto py-1">
                      <li>
                        <button
                          type="button"
                          onClick={() => { setParentId(''); setShowParentDropdown(false); setParentSearch(''); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-stone-500 hover:bg-stone-50 transition-colors italic"
                        >
                          Không có (gốc gia phả)
                        </button>
                      </li>
                      {filteredParents.map((m) => (
                        <li key={m.id}>
                          <button
                            type="button"
                            onClick={() => { setParentId(m.id); setShowParentDropdown(false); setParentSearch(''); }}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 transition-colors flex flex-col ${
                              m.id === parentId ? 'bg-red-50 text-red-700' : 'text-stone-800'
                            }`}
                          >
                            <span className="font-medium">{m.fullName}</span>
                            {(m.birthYear || m.deathYear) && (
                              <span className="text-xs text-stone-400">
                                {m.birthYear ?? '?'} – {m.deathYear ?? 'nay'}
                              </span>
                            )}
                          </button>
                        </li>
                      ))}
                      {filteredParents.length === 0 && (
                        <li className="px-4 py-3 text-sm text-stone-400 text-center">
                          Không tìm thấy thành viên
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <input
                type="text"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                placeholder="ID của thành viên cha/mẹ (để trống nếu là gốc)"
                className={`${inputCls} font-mono text-xs`}
              />
            )}
          </div>

          {/* Spouses list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-600">
                Vợ / Chồng
                {spouses.filter(Boolean).length > 0 && (
                  <span className="ml-1.5 text-[10px] font-bold text-purple-600 bg-purple-50 rounded-full px-1.5 py-0.5">
                    {spouses.filter(Boolean).length}
                  </span>
                )}
              </label>
              <button
                type="button"
                onClick={addSpouse}
                className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Thêm
              </button>
            </div>
            <div className="space-y-2">
              {spouses.map((s, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="text-xs text-stone-400 w-12 flex-shrink-0 text-right">
                    {idx === 0 ? 'Vợ/chồng cả' : `Vợ/chồng ${idx + 1}`}
                  </span>
                  <input
                    type="text"
                    value={s}
                    onChange={(e) => updateSpouse(idx, e.target.value)}
                    placeholder={`Tên vợ/chồng ${idx + 1}`}
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => removeSpouse(idx)}
                    className="px-2.5 py-2 text-stone-400 hover:text-red-600 transition-colors rounded-xl hover:bg-red-50 flex-shrink-0"
                    aria-label="Xóa"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {spouses.length === 0 && (
                <p className="text-xs text-stone-400 px-1 py-1">Chưa có vợ/chồng nào được thêm</p>
              )}
            </div>
          </div>

          {/* Mother name (for grouping children by branch) */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">
              Tên mẹ <span className="text-stone-400 font-normal">(dùng để nhóm con theo nhánh)</span>
            </label>
            <input
              type="text"
              value={motherName}
              onChange={(e) => setMotherName(e.target.value)}
              placeholder="Tên người mẹ của thành viên này"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* ── Số liệu thống kê (chỉ xem) ── */}
      {hasStats && (
        <div>
          <SectionLabel>Số liệu thống kê</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Đời thứ', value: initialData?.generation },
              { label: 'Số anh chị em', value: initialData?.siblingsCount },
              { label: 'Số con trai', value: initialData?.sonsCount },
              { label: 'Số con gái', value: initialData?.daughtersCount },
              { label: 'Số con cháu', value: initialData?.descendantsCount },
            ].map(({ label, value }) => (
              <div key={label} className="bg-stone-50 rounded-xl px-4 py-3 text-center">
                <div className="text-2xl font-bold text-stone-800">
                  {value ?? '—'}
                </div>
                <div className="text-xs text-stone-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-stone-400 mt-2">
            Số liệu được tính tự động — dùng nút &quot;Tính lại số liệu&quot; để cập nhật.
          </p>
        </div>
      )}

      {/* ── Tiểu sử & Thành tựu ── */}
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

          {/* Achievements */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-600">
                Thành tựu cá nhân
                {achievements.filter(Boolean).length > 0 && (
                  <span className="ml-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 rounded-full px-1.5 py-0.5">
                    {achievements.filter(Boolean).length}
                  </span>
                )}
              </label>
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

          {/* Contributions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-600">
                Đóng góp cho gia tộc
                {contributions.filter(Boolean).length > 0 && (
                  <span className="ml-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 rounded-full px-1.5 py-0.5">
                    {contributions.filter(Boolean).length}
                  </span>
                )}
              </label>
              <button
                type="button"
                onClick={addContribution}
                className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Thêm
              </button>
            </div>
            <div className="space-y-2">
              {contributions.map((c, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={c}
                    onChange={(e) => updateContribution(idx, e.target.value)}
                    placeholder={`Đóng góp ${idx + 1}`}
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => removeContribution(idx)}
                    className="px-2.5 py-2 text-stone-400 hover:text-red-600 transition-colors rounded-xl hover:bg-red-50 flex-shrink-0"
                    aria-label="Xóa"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {contributions.length === 0 && (
                <p className="text-xs text-stone-400 px-1 py-1">Chưa có đóng góp nào được thêm</p>
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
