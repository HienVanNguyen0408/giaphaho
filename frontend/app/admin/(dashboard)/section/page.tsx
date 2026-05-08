'use client';

import { useEffect, useState, useRef, FormEvent } from 'react';
import { getSections, createSection, toggleSection, deleteSection, updateSection, reorderSections } from '@/lib/api';
import { AdminActionButton } from '@/components/admin/ui/AdminActionButton';
import AdminPageHeader, { AdminMetaChip } from '@/components/admin/ui/AdminPageHeader';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import type { Section, SectionType } from '@/types';

const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  TIN_NOI_BAT: 'Tin nổi bật',
  THANH_TICH: 'Giá trị dòng họ',
  TIN_TUC: 'Tin tức',
  VIDEO: 'Video',
  CUSTOM: 'Tùy chỉnh',
};

const DEFAULT_SECTIONS: Array<{ name: string; type: SectionType; order: number }> = [
  { name: 'Tin nổi bật', type: 'TIN_NOI_BAT', order: 0 },
  { name: 'Giá trị dòng họ', type: 'THANH_TICH', order: 1 },
  { name: 'Tin tức', type: 'TIN_TUC', order: 2 },
  { name: 'Video', type: 'VIDEO', order: 3 },
];

function EditIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125 16.875 4.5M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  );
}

function TrashIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673A2.25 2.25 0 0 1 15.916 21H8.084a2.25 2.25 0 0 1-2.244-1.827L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
}

const TEMPLATES = [
  {
    id: 'news-first',
    name: 'Tin tức trước',
    desc: 'Đặt các mục tin tức lên đầu trang chủ',
    icon: '📰',
    keywords: ['tin', 'tức', 'news', 'bài'],
  },
  {
    id: 'family-first',
    name: 'Gia phả nổi bật',
    desc: 'Đặt mục gia phả và thành tích lên đầu',
    icon: '🌳',
    keywords: ['gia', 'phả', 'thành', 'tích', 'family'],
  },
  {
    id: 'video-first',
    name: 'Video nổi bật',
    desc: 'Đặt mục video và hình ảnh lên đầu',
    icon: '🎬',
    keywords: ['video', 'clip', 'hình', 'ảnh', 'media'],
  },
];

function applyTemplate(sections: Section[], keywords: string[]): Section[] {
  const priority: Section[] = [];
  const rest: Section[] = [];
  for (const s of sections) {
    const lower = s.name.toLowerCase();
    if (keywords.some((k) => lower.includes(k))) {
      priority.push(s);
    } else {
      rest.push(s);
    }
  }
  return [...priority, ...rest];
}

export default function SectionAdminPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add form
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<SectionType>('CUSTOM');
  const [adding, setAdding] = useState(false);

  // Edit form
  const [editTarget, setEditTarget] = useState<Section | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<SectionType>('CUSTOM');
  const [editing, setEditing] = useState(false);

  // Seed
  const [seeding, setSeeding] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Section | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toggle
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Drag state
  const draggedId = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(TEMPLATES[0].id);

  const fetchSections = () => {
    setLoading(true);
    getSections(true)
      .then((res) => setSections(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const persistReorder = async (ordered: Section[]) => {
    setReordering(true);
    try {
      await reorderSections(ordered.map((s) => s.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sắp xếp thất bại');
      fetchSections();
    } finally {
      setReordering(false);
    }
  };

  const handleDragStart = (id: string) => {
    draggedId.current = id;
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedId.current !== id) setDragOverId(id);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const fromId = draggedId.current;
    if (!fromId || fromId === targetId) {
      setDragOverId(null);
      return;
    }
    const items = [...sections];
    const from = items.findIndex((s) => s.id === fromId);
    const to = items.findIndex((s) => s.id === targetId);
    const [item] = items.splice(from, 1);
    items.splice(to, 0, item);
    setSections(items);
    setDragOverId(null);
    draggedId.current = null;
    persistReorder(items);
  };

  const handleDragEnd = () => {
    draggedId.current = null;
    setDragOverId(null);
  };

  const applyTemplateOrder = (template: (typeof TEMPLATES)[0]) => {
    const newOrder = applyTemplate(sections, template.keywords);
    setSections(newOrder);
    persistReorder(newOrder);
  };

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    setError(null);
    try {
      await createSection({ name: newName.trim(), type: newType });
      setNewName('');
      setNewType('CUSTOM');
      fetchSections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Thêm section thất bại');
    } finally {
      setAdding(false);
    }
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editTarget || !editName.trim()) return;
    setEditing(true);
    try {
      await updateSection(editTarget.id, { name: editName.trim(), type: editType });
      setEditTarget(null);
      fetchSections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sửa thất bại');
    } finally {
      setEditing(false);
    }
  };

  const openEdit = (section: Section) => {
    setEditTarget(section);
    setEditName(section.name);
    setEditType(section.type ?? 'CUSTOM');
  };

  const handleSeedDefaults = async () => {
    if (seeding) return;
    setSeeding(true);
    setError(null);
    const existingTypes = new Set(sections.map((s) => s.type));
    const toCreate = DEFAULT_SECTIONS.filter((d) => !existingTypes.has(d.type));
    try {
      for (const s of toCreate) {
        await createSection(s);
      }
      fetchSections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tạo mục mặc định thất bại');
    } finally {
      setSeeding(false);
    }
  };

  const handleToggle = async (section: Section) => {
    setTogglingId(section.id);
    try {
      await toggleSection(section.id);
      fetchSections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật thất bại');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSection(deleteTarget.id);
      setDeleteTarget(null);
      fetchSections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xóa thất bại');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="w-full space-y-5 relative">
      <AdminPageHeader
        title="Mục trang chủ"
        eyebrow="Quản trị giao diện"
        description="Chọn bố cục gợi ý hoặc kéo từng mục để đổi thứ tự hiển thị trên trang chủ."
        meta={
          <>
            <AdminMetaChip label="Tổng" value={`${sections.length} mục`} tone="blue" />
            <AdminMetaChip label="Đang hiện" value={`${sections.filter((section) => section.isActive).length} mục`} tone="green" />
            <AdminMetaChip label="Sắp xếp" value="Kéo thả để đổi thứ tự" />
          </>
        }
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-stone-900">Gợi ý layout nhanh</h2>
              <p className="mt-1 text-xs text-stone-500">Chọn một preset rồi bấm áp dụng. Có thể kéo thả thủ công sau đó.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const selected = TEMPLATES.find((template) => template.id === selectedTemplateId);
                if (selected) applyTemplateOrder(selected);
              }}
              disabled={loading || reordering}
              className="inline-flex items-center justify-center rounded-xl bg-red-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-900 disabled:opacity-50"
            >
              Áp dụng layout
            </button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {TEMPLATES.map((template) => {
              const selected = selectedTemplateId === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`flex min-h-24 items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                    selected
                      ? 'border-red-200 bg-red-50 text-red-900 ring-1 ring-inset ring-red-100'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-red-200 hover:bg-red-50/40'
                  }`}
                >
                  <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-white text-xl ring-1 ring-inset ring-stone-200">
                    {template.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{template.name}</span>
                    <span className="mt-1 block text-xs leading-5 text-stone-500">{template.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <h2 className="text-sm font-semibold text-amber-900">Cách kéo thả</h2>
          <div className="mt-2 space-y-2 text-xs leading-5 text-amber-800">
            <p>Giữ vùng tay nắm ở đầu mỗi dòng rồi kéo lên hoặc xuống.</p>
            <p>Dòng được tô đỏ là vị trí sẽ thả. Hệ thống tự lưu ngay sau khi thả.</p>
          </div>
        </div>
      </div>

      {/* Seed defaults banner */}
      {sections.every((s) => !s.type || s.type === 'CUSTOM') && (
        <div className="w-full bg-amber-50 rounded-2xl border border-amber-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-amber-900">Chưa có mục nội dung nào</p>
            <p className="mt-0.5 text-xs text-amber-700">
              Tạo 4 mục mặc định (Tin nổi bật, Giá trị dòng họ, Tin tức, Video) để bật chế độ điều khiển thứ tự từ admin.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSeedDefaults}
            disabled={seeding}
            className="flex-shrink-0 px-4 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors disabled:opacity-60 whitespace-nowrap"
          >
            {seeding ? 'Đang tạo...' : 'Tạo mục mặc định'}
          </button>
        </div>
      )}

      {/* Add form */}
      <div className="w-full bg-white rounded-2xl border border-stone-200 shadow-sm p-4">
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-stone-900">Thêm mục</h2>
            <span className="text-xs text-stone-400">— Tạo khối nội dung mới</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Tên mục (VD: Tin tức, Video...)"
              required
              className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as SectionType)}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors bg-white sm:w-52"
            >
              {(Object.entries(SECTION_TYPE_LABELS) as [SectionType, string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={adding}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-red-800 hover:bg-red-900 rounded-xl transition-colors disabled:opacity-60 whitespace-nowrap"
            >
              {adding ? 'Đang thêm...' : 'Thêm mục'}
            </button>
          </div>
        </form>
      </div>

      {/* Section list with drag-and-drop */}
      <div className="w-full bg-white rounded-2xl border border-stone-200 shadow-sm overflow-visible">
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-5 py-3">
          <div>
            <h2 className="text-sm font-semibold text-stone-900">Thứ tự hiển thị</h2>
            <p className="mt-0.5 text-xs text-stone-500">Kéo tay nắm để đổi vị trí các mục trên trang chủ.</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-stone-600 ring-1 ring-inset ring-stone-200">
            {sections.length} mục
          </span>
        </div>
        {reordering && (
          <div className="px-5 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-700 flex items-center gap-2">
            <span className="w-3 h-3 border-2 border-amber-400 border-t-amber-700 rounded-full animate-spin" />
            Đang lưu thứ tự...
          </div>
        )}
        {loading ? (
          <div className="p-5 space-y-3 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 w-40 bg-stone-100 rounded" />
                <div className="h-8 w-24 bg-stone-100 rounded-lg" />
              </div>
            ))}
          </div>
        ) : sections.length === 0 ? (
          <div className="px-5 py-10 text-center text-stone-400 text-sm">Chưa có mục nào</div>
        ) : (
          <ul className="space-y-2 p-3">
            {sections.map((section, idx) => (
              <li
                key={section.id}
                draggable
                onDragStart={() => handleDragStart(section.id)}
                onDragOver={(e) => handleDragOver(e, section.id)}
                onDrop={(e) => handleDrop(e, section.id)}
                onDragEnd={handleDragEnd}
                className={`flex flex-col rounded-xl border px-4 py-3 transition-all sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${
                  dragOverId === section.id
                    ? 'border-red-300 bg-red-50 ring-2 ring-red-100'
                    : 'border-stone-200 bg-white hover:border-red-200 hover:bg-red-50/20'
                }`}
              >
                <div className="flex min-w-0 items-center gap-3 overflow-visible">
                  <div className="flex h-12 w-12 flex-shrink-0 cursor-grab items-center justify-center rounded-xl border border-stone-200 bg-stone-50 text-stone-400 active:cursor-grabbing">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8-16a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                    </svg>
                  </div>
                  <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-red-50 text-sm font-bold tabular-nums text-red-800 ring-1 ring-inset ring-red-100">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="block truncate text-base font-semibold text-stone-900">{section.name}</span>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        section.type === 'CUSTOM'
                          ? 'bg-stone-100 text-stone-500'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {(section.type && SECTION_TYPE_LABELS[section.type]) ?? 'Tùy chỉnh'}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        section.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'
                      }`}>
                        {section.isActive ? 'Đang hiện' : 'Đang ẩn'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-3 sm:mt-0">
                  <button
                    onClick={() => handleToggle(section)}
                    disabled={togglingId === section.id}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${section.isActive ? 'bg-green-500' : 'bg-stone-300'}`}
                    role="switch"
                    aria-checked={section.isActive}
                    aria-label={section.isActive ? 'Đang hiện' : 'Đang ẩn'}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${section.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>

                  <div className="w-px h-4 bg-stone-200 mx-1" />

                  <AdminActionButton label="Sửa mục" tone="blue" onClick={() => openEdit(section)}>
                    <EditIcon />
                  </AdminActionButton>
                  <AdminActionButton label="Xóa mục" tone="red" onClick={() => setDeleteTarget(section)}>
                    <TrashIcon />
                  </AdminActionButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-xs text-stone-400 text-center">Kéo thả các mục để thay đổi thứ tự hiển thị trên trang chủ</p>

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
              <h3 className="text-base font-bold text-stone-900">Sửa mục hiển thị</h3>
              <button onClick={() => setEditTarget(null)} className="text-stone-400 hover:text-stone-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Tên mục</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Loại nội dung</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as SectionType)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors bg-white"
                >
                  {(Object.entries(SECTION_TYPE_LABELS) as [SectionType, string][]).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-stone-400">
                  Mục "Tùy chỉnh" chỉ hiển thị thẻ tên, không hiển thị nội dung trang chủ.
                </p>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setEditTarget(null)} className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors">Hủy</button>
                <button type="submit" disabled={editing} className="px-6 py-2 text-sm font-semibold text-white bg-[var(--t-accent)] hover:bg-[var(--t-accent-2)] rounded-xl transition-colors disabled:opacity-60">
                  {editing ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa mục"
        message={`Bạn có chắc muốn xóa mục "${deleteTarget?.name}"?`}
        confirmText={deleting ? 'Đang xóa...' : 'Xóa'}
        cancelText="Hủy"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
