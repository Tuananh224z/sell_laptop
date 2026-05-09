import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search, X, Upload, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../config/Axios';
import DeleteConfirmModal from './DeleteConfirmModal';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const imgSrc = (url: string) => url ? (url.startsWith('http') ? url : `${BACKEND}${url}`) : '';
const DEFAULT_IMG = 'https://placehold.co/80x80/f3f4f6/9ca3af?text=No+Image';

/* ─── Types ─── */
interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
  isVisible: boolean;
  sortOrder: number;
  productCount: number;
}


/* ─── Toast ─── */
const Toast = ({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-medium text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      {msg}
      <button onClick={onClose}><X className="w-4 h-4 opacity-70 hover:opacity-100" /></button>
    </div>
  );
};

/* ─── Category Form Modal ─── */
interface ModalProps {
  cat: Partial<Category> | null;
  onClose: () => void;
  onSaved: (cat: Category) => void;
}

const CategoryModal = ({ cat, onClose, onSaved }: ModalProps) => {
  const isNew = !cat?._id;
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: cat?.name ?? '',
    slug: cat?.slug ?? '',
    isVisible: cat?.isVisible ?? true,
    sortOrder: cat?.sortOrder ?? 0,
  });
  const [preview, setPreview] = useState<string>(cat?.image ? imgSrc(cat.image) : '');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  // Tự động sinh slug từ tên
  const toSlug = (t: string) =>
    t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

  const handleNameChange = (v: string) => {
    set('name', v);
    if (isNew) set('slug', toSlug(v));
  };

  const handleFile = (f: File) => {
    if (f.size > 2 * 1024 * 1024) { setError('Ảnh tối đa 2MB'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Tên danh mục không được trống'); return; }
    if (!form.slug.trim()) { setError('Slug không được trống'); return; }
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('slug', form.slug);
      fd.append('isVisible', String(form.isVisible));
      fd.append('sortOrder', String(form.sortOrder));
      if (file) fd.append('image', file);

      const { data } = isNew
        ? await api.post('/categories', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        : await api.put(`/categories/${cat!._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });

      onSaved(data);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-extrabold text-gray-900">{isNew ? 'Thêm danh mục' : 'Chỉnh sửa danh mục'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500"><X className="w-5 h-5" /></button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Tên danh mục <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={e => handleNameChange(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Ví dụ: Laptop Gaming" />
          </div>

          {/* Slug */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Slug (URL) <span className="text-red-500">*</span></label>
            <input value={form.slug} onChange={e => set('slug', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none font-mono"
              placeholder="laptop-gaming" />
            <p className="text-xs text-gray-400 mt-1">Dùng trong URL: /danh-muc/<span className="font-medium">{form.slug || '...'}</span></p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Ảnh danh mục</label>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            {preview ? (
              <div className="relative group w-full h-36 rounded-xl overflow-hidden border border-gray-200">
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-100 flex items-center gap-1">
                    <Upload className="w-3 h-3" /> Đổi ảnh
                  </button>
                  <button type="button" onClick={() => { setPreview(''); setFile(null); }}
                    className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-600">
                    Xoá
                  </button>
                </div>
              </div>
            ) : (
              <div onClick={() => fileRef.current?.click()} onDrop={handleDrop} onDragOver={e => e.preventDefault()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all">
                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Kéo thả hoặc <span className="text-primary-600 font-medium">chọn file</span></p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — tối đa 2MB</p>
              </div>
            )}
          </div>

          {/* Status + Sort */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Trạng thái</label>
              <select value={form.isVisible ? '1' : '0'} onChange={e => set('isVisible', e.target.value === '1')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                <option value="1">Hiển thị</option>
                <option value="0">Ẩn</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Thứ tự</label>
              <input type="number" value={form.sortOrder} onChange={e => set('sortOrder', Number(e.target.value))} min={0}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Huỷ</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Đang lưu...' : 'Lưu danh mục'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Page ─── */
const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<Partial<Category> | null | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => setToast({ msg, type });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories', { params: { search } });
      setCategories(data);
    } catch {
      showToast('Không thể tải danh mục', 'error');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleSaved = (saved: Category) => {
    setCategories(prev => {
      const idx = prev.findIndex(c => c._id === saved._id);
      if (idx >= 0) { const list = [...prev]; list[idx] = saved; return list; }
      return [saved, ...prev];
    });
    setModal(undefined);
    showToast(modal?._id ? 'Cập nhật danh mục thành công!' : 'Thêm danh mục thành công!');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/categories/${deleteTarget._id}`);
      setCategories(prev => prev.filter(c => c._id !== deleteTarget._id));
      showToast(`Đã xoá danh mục "${deleteTarget.name}"`);
    } catch (err: unknown) {
      showToast((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Không thể xoá', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleToggle = async (cat: Category) => {
    try {
      const { data } = await api.patch(`/categories/${cat._id}/visibility`);
      setCategories(prev => prev.map(c => c._id === data._id ? data : c));
      showToast(data.isVisible ? 'Đã hiển thị danh mục' : 'Đã ẩn danh mục');
    } catch {
      showToast('Không thể cập nhật trạng thái', 'error');
    }
  };

  return (
    <div className="p-6 space-y-5">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Quản lý danh mục</h1>
          <p className="text-sm text-gray-500 mt-0.5">{categories.length} danh mục</p>
        </div>
        <button onClick={() => setModal({})}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm">
          <Plus className="w-4 h-4" /> Thêm danh mục
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm danh mục..."
          className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm w-full focus:ring-1 focus:ring-primary-500 outline-none" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-28">Ảnh</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Danh mục</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Sản phẩm</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Thứ tự</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-5 py-3"><div className="w-10 h-10 bg-gray-200 rounded-lg" /></td>
                  <td className="px-5 py-3">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-1" />
                    <div className="h-3 w-20 bg-gray-100 rounded" />
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell"><div className="h-4 w-10 bg-gray-200 rounded mx-auto" /></td>
                  <td className="px-5 py-3 hidden sm:table-cell"><div className="h-4 w-8 bg-gray-200 rounded mx-auto" /></td>
                  <td className="px-5 py-3"><div className="h-5 w-16 bg-gray-200 rounded-full mx-auto" /></td>
                  <td className="px-5 py-3"><div className="h-6 w-16 bg-gray-200 rounded mx-auto" /></td>
                </tr>
              ))
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-gray-400">
                  <p className="text-base font-medium">Không có danh mục nào</p>
                  <p className="text-sm mt-1">Hãy thêm danh mục đầu tiên</p>
                </td>
              </tr>
            ) : categories.map(c => (
              <tr key={c._id} className={`hover:bg-gray-50/70 transition-colors ${!c.isVisible ? 'opacity-60' : ''}`}>
                <td className="px-4 py-2">
                  <img
                    src={imgSrc(c.image) || DEFAULT_IMG}
                    alt={c.name}
                    className="w-20 h-20 object-cover rounded-xl border border-gray-100"
                    onError={e => { (e.target as HTMLImageElement).src = DEFAULT_IMG; }}
                  />
                </td>
                {/* Name / slug */}
                <td className="px-5 py-3">
                  <p className="font-semibold text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">/{c.slug}</p>
                </td>
                {/* Product count */}
                <td className="px-5 py-3 text-center text-gray-700 hidden md:table-cell font-medium">
                  {c.productCount}
                </td>
                {/* Sort order */}
                <td className="px-5 py-3 text-center text-gray-500 hidden sm:table-cell text-xs">
                  {c.sortOrder}
                </td>
                {/* Visibility */}
                <td className="px-5 py-3 text-center">
                  <button onClick={() => handleToggle(c)}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors
                      ${c.isVisible ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {c.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {c.isVisible ? 'Hiển thị' : 'Ẩn'}
                  </button>
                </td>
                {/* Actions */}
                <td className="px-5 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => setModal(c)} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal !== undefined && (
        <CategoryModal cat={modal} onClose={() => setModal(undefined)} onSaved={handleSaved} />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          title="Xoá danh mục"
          message={`Bạn có chắc muốn xoá danh mục "${deleteTarget.name}"? Hành động này không thể hoàn tác.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default AdminCategories;
