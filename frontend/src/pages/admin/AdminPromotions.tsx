import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Tag, Percent, Calendar, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';
import DeleteConfirmModal from './DeleteConfirmModal';
import api from '../../lib/api';
import { toast } from 'react-toastify';

interface Promo {
  _id: string;
  code: string;
  name: string;
  type: 'percentage' | 'fixed' | 'shipping';
  value: number;
  minOrderValue: number;
  usageLimit: number | null;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  maxDiscount?: number;
}

const typeLabel: Record<string, { text: string; color: string }> = {
  percentage: { text: '% Giảm giá', color: 'bg-violet-100 text-violet-700' },
  fixed:      { text: 'Giảm tiền cố định', color: 'bg-blue-100 text-blue-700' },
  shipping:   { text: 'Miễn phí ship', color: 'bg-green-100 text-green-700' },
};

const PromoModal = ({ promo, onClose, onSave }: { promo: Partial<Promo> | null; onClose: () => void; onSave: () => void }) => {
  const isNew = !promo?._id;
  const [form, setForm] = useState({
    code: promo?.code ?? '',
    name: promo?.name ?? '',
    type: promo?.type ?? 'percentage',
    value: promo?.value ?? 0,
    minOrderValue: promo?.minOrderValue ?? 0,
    maxDiscount: promo?.maxDiscount ?? 0,
    usageLimit: promo?.usageLimit ?? 0,
    startDate: promo?.startDate ? new Date(promo.startDate).toISOString().split('T')[0] : '',
    endDate: promo?.endDate ? new Date(promo.endDate).toISOString().split('T')[0] : '',
    isActive: promo?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.code || !form.name || !form.startDate || !form.endDate) {
      return toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
    }
    setLoading(true);
    try {
      if (isNew) {
        await api.post('/coupons', form);
        toast.success('Thêm mã giảm giá thành công');
      } else {
        await api.patch(`/coupons/${promo?._id}`, form);
        toast.success('Cập nhật mã giảm giá thành công');
      }
      onSave();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-gray-900">{isNew ? 'Thêm khuyến mại' : 'Chỉnh sửa khuyến mại'}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Mã giảm giá *</label>
              <input 
                value={form.code} 
                onChange={e => set('code', e.target.value.toUpperCase())} 
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold tracking-widest focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none uppercase transition-all bg-gray-50/50" 
                placeholder="VD: SALE50" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Loại hình</label>
              <select 
                value={form.type} 
                onChange={e => set('type', e.target.value)} 
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
              >
                <option value="percentage">% Giảm giá</option>
                <option value="fixed">Giảm tiền cố định</option>
                <option value="shipping">Miễn phí ship</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Tên chương trình *</label>
            <input 
              value={form.name} 
              onChange={e => set('name', e.target.value)} 
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" 
              placeholder="VD: Khuyến mại hè 2026" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                {form.type === 'percentage' ? 'Phần trăm giảm (%)' : 'Số tiền giảm (₫)'}
              </label>
              <input 
                type="number" 
                value={form.value} 
                onChange={e => set('value', Number(e.target.value))} 
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold text-primary-600" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Đơn tối thiểu (₫)</label>
              <input 
                type="number" 
                value={form.minOrderValue} 
                onChange={e => set('minOrderValue', Number(e.target.value))} 
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" 
              />
            </div>
          </div>

          {form.type === 'percentage' && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Giảm tối đa (₫) (0 = không giới hạn)</label>
              <input 
                type="number" 
                value={form.maxDiscount} 
                onChange={e => set('maxDiscount', Number(e.target.value))} 
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" 
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Tổng số lượt dùng (0 = không giới hạn)</label>
            <input 
              type="number" 
              value={form.usageLimit} 
              onChange={e => set('usageLimit', Number(e.target.value))} 
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Ngày bắt đầu</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input 
                  type="date" 
                  value={form.startDate} 
                  onChange={e => set('startDate', e.target.value)} 
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" 
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Ngày kết thúc</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input 
                  type="date" 
                  value={form.endDate} 
                  onChange={e => set('endDate', e.target.value)} 
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" 
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${form.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{form.isActive ? 'Đang kích hoạt' : 'Đang tạm dừng'}</p>
                <p className="text-xs text-gray-500">Người dùng {form.isActive ? 'có thể' : 'không thể'} sử dụng mã này</p>
              </div>
            </div>
            <button onClick={() => set('isActive', !form.isActive)} type="button">
              {form.isActive ? <ToggleRight className="w-10 h-10 text-primary-600" /> : <ToggleLeft className="w-10 h-10 text-gray-300" />}
            </button>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white/80 backdrop-blur-md">
          <button onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Huỷ</button>
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-semibold transition-all shadow-md shadow-primary-100"
          >
            {loading ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminPromotions = () => {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<Partial<Promo> | null | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Promo | null>(null);
  const [filter, setFilter] = useState('all');

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/coupons');
      setPromos(data);
    } catch (err) {
      console.error('Fetch promos failed', err);
      toast.error('Không thể tải danh sách khuyến mại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPromos(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/coupons/${deleteTarget._id}`);
      toast.success('Xóa mã giảm giá thành công');
      setPromos(prev => prev.filter(p => p._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể xóa');
    }
  };

  const filtered = promos
    .filter(p => filter === 'all' ? true : filter === 'active' ? p.isActive : !p.isActive)
    .filter(p => p.code.includes(search.toUpperCase()) || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Quản lý khuyến mại</h1>
          <p className="text-sm text-gray-500 mt-0.5">{loading ? 'Đang tải...' : `${filtered.length} mã giảm giá được tìm thấy`}</p>
        </div>
        <button 
          onClick={() => setModal({})} 
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-primary-100 hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Thêm mã mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Tổng số mã', value: promos.length, color: 'text-gray-900', bg: 'bg-white' },
          { label: 'Đang chạy', value: promos.filter(p => p.isActive).length, color: 'text-green-600', bg: 'bg-green-50/50' },
          { label: 'Tạm dừng', value: promos.filter(p => !p.isActive).length, color: 'text-orange-600', bg: 'bg-orange-50/50' },
          { label: 'Lượt đã dùng', value: promos.reduce((s, p) => s + (p.usedCount || 0), 0), color: 'text-primary-600', bg: 'bg-primary-50/50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-100 shadow-sm p-5 text-center transition-transform hover:-translate-y-1`}>
            <p className={`text-2xl font-black ${s.color}`}>{loading ? '...' : s.value}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-wrap bg-gray-50/30">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Tìm mã hoặc tên chương trình..." 
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm w-full focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" 
            />
          </div>
          <div className="flex gap-1.5 p-1 bg-white rounded-xl border border-gray-200">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'active', label: 'Đang chạy' },
              { id: 'inactive', label: 'Tạm dừng' }
            ].map(f => (
              <button 
                key={f.id} 
                onClick={() => setFilter(f.id)} 
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f.id ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/50">
              <tr>
                {['Mã', 'Tên chương trình', 'Loại', 'Giá trị', 'Hiệu lực', 'Trạng thái', 'Thao tác'].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">Đang tải dữ liệu...</td></tr>
              ) : filtered.length > 0 ? (
                filtered.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50/70 transition-colors group">
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-100">{p.code}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900">{p.name}</p>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                        Lượt dùng: <span className="font-bold text-gray-600">{p.usedCount || 0}/{p.usageLimit || '∞'}</span>
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${typeLabel[p.type]?.color}`}>
                        {typeLabel[p.type]?.text}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-black text-gray-900">
                      {p.type === 'percentage' ? `${p.value}%` : `${p.value.toLocaleString('vi-VN')}₫`}
                    </td>
                    <td className="px-5 py-4 text-[10px] text-gray-500 leading-tight">
                      <div>{new Date(p.startDate).toLocaleDateString('vi-VN')}</div>
                      <div className="text-gray-300">↓</div>
                      <div>{new Date(p.endDate).toLocaleDateString('vi-VN')}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.isActive ? 'Đang chạy' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setModal(p)} className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all shadow-sm">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(p)} className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">Không có mã giảm giá nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal !== undefined && (
        <PromoModal 
          promo={modal} 
          onClose={() => setModal(undefined)} 
          onSave={fetchPromos}
        />
      )}
      
      {deleteTarget && (
        <DeleteConfirmModal 
          title="Xóa mã khuyến mại" 
          message={`Hành động này không thể hoàn tác. Bạn có chắc muốn xóa mã "${deleteTarget.code}"?`} 
          onConfirm={handleDelete} 
          onClose={() => setDeleteTarget(null)} 
        />
      )}
    </div>
  );
};

export default AdminPromotions;
