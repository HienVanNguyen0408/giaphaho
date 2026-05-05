'use client';

import { useEffect, useState, FormEvent } from 'react';
import { getSections, createSection, toggleSection, deleteSection, updateSection } from '@/lib/api';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import type { Section } from '@/types';

export default function SectionAdminPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add form
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  // Edit form
  const [editTarget, setEditTarget] = useState<Section | null>(null);
  const [editName, setEditName] = useState('');
  const [editLayout, setEditLayout] = useState<'list' | 'grid' | 'featured'>('list');
  const [editing, setEditing] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Section | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toggle
  const [togglingId, setTogglingId] = useState<string | null>(null);

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

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    setError(null);
    try {
      await createSection({ name: newName.trim(), layout: 'list' } as any);
      setNewName('');
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
      await updateSection(editTarget.id, { name: editName.trim(), layout: editLayout } as any);
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
    setEditLayout((section as any).layout || 'list');
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
    <div className="max-w-4xl mx-auto space-y-5 relative">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Mục trang chủ</h1>
        <p className="text-stone-500 text-sm mt-0.5">Quản lý các mục hiển thị trên trang chủ</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Add form */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-stone-800 mb-3">Thêm mục mới</h2>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Tên mục (VD: Gia phả, Tin tức...)"
            required
            className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
          />
          <button
            type="submit"
            disabled={adding}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-stone-800 hover:bg-stone-900 rounded-xl transition-colors disabled:opacity-60 whitespace-nowrap"
          >
            {adding ? 'Đang thêm...' : '+ Thêm mục'}
          </button>
        </form>
      </div>

      {/* Section list */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
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
          <ul className="divide-y divide-stone-100">
            {sections.map((section) => (
              <li
                key={section.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 gap-4 hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-stone-400 font-mono w-5 text-center">
                    {section.order}
                  </span>
                  <div>
                    <span className="font-semibold text-stone-800 text-sm block">{section.name}</span>
                    <span className="text-xs text-stone-500">
                      Bố cục: <span className="font-medium text-stone-700 capitalize">{(section as any).layout || 'Mặc định'}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Toggle switch */}
                  <button
                    onClick={() => handleToggle(section)}
                    disabled={togglingId === section.id}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                      section.isActive ? 'bg-green-500' : 'bg-stone-300'
                    }`}
                    role="switch"
                    aria-checked={section.isActive}
                    aria-label={section.isActive ? 'Đang hiện' : 'Đang ẩn'}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        section.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-xs w-10 ${section.isActive ? 'text-green-600' : 'text-stone-400'}`}>
                    {section.isActive ? 'Hiện' : 'Ẩn'}
                  </span>
                  
                  <div className="w-px h-4 bg-stone-200 mx-1"></div>

                  <button
                    onClick={() => openEdit(section)}
                    className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => setDeleteTarget(section)}
                    className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Edit Modal Popup */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
              <h3 className="font-semibold text-stone-800">Sửa mục hiển thị</h3>
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
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Bố cục hiển thị (Layout)</label>
                <select
                  value={editLayout}
                  onChange={(e) => setEditLayout(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors bg-white"
                >
                  <option value="list">Dạng danh sách dọc (List)</option>
                  <option value="grid">Dạng lưới (Grid)</option>
                  <option value="featured">Nổi bật (Featured)</option>
                </select>
                <p className="text-xs text-stone-500 mt-1.5">Chọn cách bài viết/dữ liệu trong mục này sẽ được sắp xếp trên trang chủ.</p>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={editing}
                  className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-60"
                >
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
