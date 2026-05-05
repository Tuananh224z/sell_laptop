import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight, Loader2, RefreshCw, X } from 'lucide-react';
import DeleteConfirmModal from './DeleteConfirmModal';
import api from '../../lib/api';
import { useCategories } from '../../hooks/useCategories';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const getImg = (url: string) => url ? (url.startsWith('http') ? url : `${BACKEND}${url}`) : '';
const DEFAULT_IMG = 'https://placehold.co/80x80/f3f4f6/9ca3af?text=No+Image';

interface Product {
  _id: string;
  sku: string;
  name: string;
  category: { _id: string; name: string } | null;
  brand: { _id: string; name: string; logo: string } | null;
  price: number;
  comparePrice: number;
  stock: number;
  isActive: boolean;
  hasVariants: boolean;
  thumbnail: string;
  isFeatured: boolean;
}

const statusColor = (p: Product) => {
  if (!p.isActive) return 'bg-gray-100 text-gray-500';
  if (p.stock === 0) return 'bg-red-100 text-red-700';
  if (p.stock < 5)  return 'bg-yellow-100 text-yellow-700';
  return 'bg-green-100 text-green-700';
};
const statusLabel = (p: Product) => {
  if (!p.isActive) return 'Ẩn';
  if (p.stock === 0) return 'Hết hàng';
  if (p.stock < 5)  return 'Sắp hết';
  return 'Đang bán';
};

const AdminProducts = () => {
  const navigate = useNavigate();
  const { categories } = useCategories();

  const [products, setProducts]     = useState<Product[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [pages, setPages]           = useState(1);
  const [loading, setLoading]       = useState(true);
  const [deleting, setDeleting]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // Filters
  const [search, setSearch]         = useState('');
  const [catFilter, setCatFilter]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const LIMIT = 15;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: LIMIT };
      if (search)      params.search   = search;
      if (catFilter)   params.category = catFilter;
      if (statusFilter === 'active')   params.status = 'active';
      if (statusFilter === 'inactive') params.status = 'inactive';

      const { data } = await api.get('/products', { params });
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [page, search, catFilter, statusFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Reset page khi filter thay đổi
  useEffect(() => { setPage(1); }, [search, catFilter, statusFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteTarget._id}`);
      setProducts(prev => prev.filter(p => p._id !== deleteTarget._id));
      setTotal(t => t - 1);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleToggleVisibility = async (p: Product) => {
    try {
      const { data } = await api.patch(`/products/${p._id}/visibility`);
      setProducts(prev => prev.map(item => item._id === data._id ? { ...item, isActive: data.isActive } : item));
    } catch { /* silent */ }
  };

  const from = (page - 1) * LIMIT + 1;
  const to   = Math.min(page * LIMIT, total);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} sản phẩm</p>
        </div>
        <button onClick={() => navigate('/admin/products/new')}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm">
          <Plus className="w-4 h-4" /> Thêm sản phẩm
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên, SKU..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm w-full focus:ring-1 focus:ring-primary-500 outline-none" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="border border-gray-200 rounded-xl text-sm px-3 py-2 focus:ring-1 focus:ring-primary-500 outline-none bg-white">
            <option value="">Tất cả danh mục</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl text-sm px-3 py-2 focus:ring-1 focus:ring-primary-500 outline-none bg-white">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã ẩn</option>
          </select>

          <button onClick={fetchProducts} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-28">Ảnh</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Sản phẩm</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Danh mục</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Giá bán</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Tồn kho</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-3"><div className="w-10 h-10 bg-gray-200 rounded-lg" /></td>
                    <td className="px-5 py-3">
                      <div className="h-4 w-40 bg-gray-200 rounded mb-1" />
                      <div className="h-3 w-20 bg-gray-100 rounded" />
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                    <td className="px-5 py-3 text-right"><div className="h-4 w-24 bg-gray-200 rounded ml-auto" /></td>
                    <td className="px-5 py-3 text-center"><div className="h-4 w-8 bg-gray-200 rounded mx-auto" /></td>
                    <td className="px-5 py-3 text-center"><div className="h-5 w-16 bg-gray-200 rounded-full mx-auto" /></td>
                    <td className="px-5 py-3"><div className="h-6 w-16 bg-gray-200 rounded mx-auto" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    <p className="text-base font-medium">Không có sản phẩm nào</p>
                    <button onClick={() => navigate('/admin/products/new')}
                      className="mt-3 text-sm text-primary-600 hover:underline">Thêm sản phẩm đầu tiên →</button>
                  </td>
                </tr>
              ) : products.map(p => (
                <tr key={p._id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-4 py-2">
                    <img
                      src={getImg(p.thumbnail) || DEFAULT_IMG}
                      alt={p.name}
                      className="w-20 h-20 object-cover rounded-xl border border-gray-100"
                      onError={e => { (e.target as HTMLImageElement).src = DEFAULT_IMG; }}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-900 max-w-[200px] truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{p.sku}{p.hasVariants && <span className="ml-1 text-violet-500 font-semibold">[Biến thể]</span>}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-600 hidden md:table-cell text-xs">{p.category?.name ?? '—'}</td>
                  <td className="px-5 py-3 text-right">
                    <p className="font-bold text-gray-900">{p.price.toLocaleString('vi-VN')}₫</p>
                    {p.comparePrice > p.price && (
                      <p className="text-xs text-gray-400 line-through">{p.comparePrice.toLocaleString('vi-VN')}₫</p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`font-bold text-sm ${p.stock === 0 ? 'text-red-500' : p.stock < 5 ? 'text-yellow-600' : 'text-gray-800'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor(p)}`}>{statusLabel(p)}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button title="Xem" className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"><Eye className="w-4 h-4" /></button>
                      <button title="Sửa" onClick={() => navigate(`/admin/products/${p._id}/edit`)}
                        className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button title="Xoá" onClick={() => setDeleteTarget(p)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>Hiển thị {total === 0 ? 0 : from}–{to} / {total}</span>
          <div className="flex gap-1">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[...Array(pages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg border text-xs font-semibold flex items-center justify-center transition-colors
                  ${page === i + 1 ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 hover:bg-gray-50'}`}>
                {i + 1}
              </button>
            ))}
            <button disabled={page >= pages} onClick={() => setPage(p => p + 1)}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {loading && products.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
        </div>
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          title="Xoá sản phẩm"
          message={`Bạn có chắc muốn xoá sản phẩm "${deleteTarget.name}"? Tất cả ảnh, video và serial sẽ bị xoá vĩnh viễn.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default AdminProducts;
