import { useState, useEffect } from 'react';
import { Search, Trash2, Gift, X, Settings, Save, Loader2, RefreshCw, Star } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'react-toastify';
import DeleteConfirmModal from './DeleteConfirmModal';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

interface Member {
  _id: string;
  name: string;
  email: string;
  phone: string;
  tier: string;
  totalSpent: number;
  points: number;
  orderCount: number;
  createdAt: string;
  avatar?: string;
}

interface Tier {
  name: string;
  minPoints: number;
  discount: number;
  color: string;
  icon: string;
  benefits: string[];
}

/* ─── Tier Settings Modal ─── */
const TierSettingsModal = ({ tiers, onClose }: { tiers: Tier[]; onClose: (t?: Tier[]) => void }) => {
  const [local, setLocal] = useState<Tier[]>(JSON.parse(JSON.stringify(tiers)));
  const [pointRate, setPointRate] = useState(1);
  const [expiryDays, setExpiryDays] = useState(90);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/membership/admin/settings');
        setPointRate(data.pointsPer1k);
        setExpiryDays(data.rankExpiryDays || 90);
      } catch (err) { /**/ }
    };
    fetchSettings();
  }, []);

  const update = (i: number, field: keyof Tier, val: any) =>
    setLocal(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: val } : t));

  const addTier = () => {
    setLocal(prev => [...prev, { name: 'Hạng mới', minPoints: 0, discount: 0, color: '#6366f1', icon: '⭐', benefits: [] }]);
  };

  const removeTier = (i: number) => {
    setLocal(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    if (local.some(t => !t.name.trim())) return toast.error('Tên hạng không được để trống');
    setLoading(true);
    try {
      await Promise.all([
        api.post('/membership/admin/tiers', { tiers: local }),
        api.post('/membership/admin/settings', { pointsPer1k: pointRate, rankExpiryDays: expiryDays })
      ]);
      const { data } = await api.get('/membership/admin/tiers');
      toast.success('Đã lưu cài đặt hạng và tích điểm');
      onClose(data);
    } catch (err) {
      toast.error('Không thể lưu cài đặt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onClose()} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-extrabold text-gray-900 text-lg">Cài đặt hạng thành viên</h2>
            <p className="text-xs text-gray-500 mt-0.5">Thiết lập ngưỡng điểm tích lũy & quyền lợi</p>
          </div>
          <button onClick={() => onClose()} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          <div className="grid grid-cols-12 gap-4 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            <span className="col-span-3">Tên Hạng</span>
            <span className="col-span-3">Điểm tích lũy từ</span>
            <span className="col-span-2">Ưu đãi (%)</span>
            <span className="col-span-3">Biểu tượng</span>
            <span className="col-span-1"></span>
          </div>
          {local.map((t, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 items-center bg-gray-50/50 rounded-xl p-3 border border-gray-100 hover:border-primary-200 transition-colors">
              <div className="col-span-3">
                <input 
                  value={t.name} 
                  onChange={e => update(i, 'name', e.target.value)}
                  placeholder="Tên hạng..."
                  className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-primary-500/20 w-full"
                />
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  value={t.minPoints}
                  onChange={e => update(i, 'minPoints', Number(e.target.value))}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary-500/20 w-full"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={t.discount}
                  onChange={e => update(i, 'discount', Number(e.target.value))}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary-500/20 w-full"
                />
              </div>
              <div className="col-span-3 flex gap-2 items-center">
                <input
                  value={t.icon}
                  onChange={e => update(i, 'icon', e.target.value)}
                  placeholder="Emoji/Icon..."
                  className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 flex-1"
                />
                <input 
                  type="color"
                  value={t.color}
                  onChange={e => update(i, 'color', e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                />
              </div>
              <div className="col-span-1 flex justify-end">
                <button 
                  onClick={() => removeTier(i)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="col-span-12 mt-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Quyền lợi (Phân cách bằng dấu phẩy)</label>
                <input 
                  value={t.benefits?.join(', ')} 
                  onChange={e => update(i, 'benefits', e.target.value.split(',').map(s => s.trim()))}
                  placeholder="Ví dụ: Miễn phí giao hàng, Quà tặng sinh nhật..."
                  className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 outline-none focus:ring-2 focus:ring-primary-500/20 w-full"
                />
              </div>
            </div>
          ))}
          <button 
            onClick={addTier}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:text-primary-600 hover:border-primary-400 hover:bg-primary-50 transition-all font-bold text-sm flex items-center justify-center gap-2"
          >
            + Thêm hạng mới
          </button>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Star className="w-3 h-3" /> Cấu hình hệ thống
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-bold text-amber-900">Tỷ lệ tích điểm</p>
                  <p className="text-[10px] text-amber-700 font-medium mt-0.5">Số điểm cho mỗi 1.000 VNĐ</p>
                </div>
                <div className="w-24 relative">
                  <input 
                    type="number"
                    value={pointRate}
                    onChange={e => setPointRate(Number(e.target.value))}
                    className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-sm font-bold text-amber-900 outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-bold text-blue-900">Thời hạn hạng</p>
                  <p className="text-[10px] text-blue-700 font-medium mt-0.5">Số ngày không mua sẽ tụt hạng</p>
                </div>
                <div className="w-24 relative">
                  <input 
                    type="number"
                    value={expiryDays}
                    onChange={e => setExpiryDays(Number(e.target.value))}
                    className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-sm font-bold text-blue-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
               <p className="text-[11px] text-gray-500 leading-relaxed italic">
                 * Ghi chú: Khi hết hạn, thành viên sẽ bị tụt 1 hạng. Điểm tích lũy sẽ được điều chỉnh về mức tối đa của hạng mới để tránh thăng hạng lại ngay lập tức.
               </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button onClick={() => onClose()} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-white bg-white transition-colors">Huỷ</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-primary-200">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Point Modal ─── */
const PointModal = ({ member, onClose, onUpdate }: { member: Member; onClose: () => void; onUpdate: (mId: string, pts: number) => void }) => {
  const [pts, setPts] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/membership/admin/user/${member._id}/points`, { points: pts });
      toast.success(data.message);
      onUpdate(member._id, data.points);
      onClose();
    } catch (err) {
      toast.error('Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900">Cộng / Trừ điểm</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm uppercase">{member.name.slice(0, 2)}</div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{member.name}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Hiện có: <span className="text-primary-600">{member.points} điểm</span></p>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Số điểm (+/-)</label>
            <input 
              type="number" 
              value={pts} 
              onChange={e => setPts(e.target.value)} 
              placeholder="VD: 100 hoặc -50" 
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" 
            />
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 bg-white">Huỷ</button>
          <button onClick={handleUpdate} disabled={loading || !pts} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-2.5 text-sm font-semibold shadow-md shadow-primary-200 disabled:opacity-50">
            {loading ? 'Đang lưu...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main ─── */
const AdminMembership = () => {
  const [data, setData] = useState<{ summary: any[]; users: Member[]; tiers: Tier[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  
  const [pointTarget, setPointTarget] = useState<Member | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/membership/admin/stats', { params: { search } });
      setData(data);
    } catch (err) {
      toast.error('Lỗi tải dữ liệu hội viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/users/${deleteTarget._id}`);
      toast.success('Đã xoá người dùng');
      setData(prev => prev ? { ...prev, users: prev.users.filter(u => u._id !== deleteTarget._id) } : null);
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Xoá thất bại');
    }
  };

  const onUpdatePoints = (mId: string, newPts: number) => {
    setData(prev => prev ? {
      ...prev,
      users: prev.users.map(u => u._id === mId ? { ...u, points: newPts } : u)
    } : null);
  };

  const filteredUsers = data?.users.filter(u => tierFilter === 'all' || u.tier === tierFilter) || [];

  const handleSync = async () => {
    setLoading(true);
    try {
      await api.post('/membership/admin/sync');
      toast.success('Đã đồng bộ lại toàn bộ hạng thành viên');
      fetchStats();
    } catch (err) {
      toast.error('Đồng bộ thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Quản lý hội viên</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">{data?.users.length || 0} thành viên đã đăng ký</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSync}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl transition-all font-bold text-sm border border-amber-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Đồng bộ hạng
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl transition-all font-bold text-sm shadow-sm"
          >
            <Settings className="w-4 h-4" />
            Cài đặt hạng
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {data?.summary.map((s: any) => (
          <div 
            key={s.name} 
            onClick={() => setTierFilter(tierFilter === s.name ? 'all' : s.name)}
            className={`bg-white rounded-2xl border-2 p-5 text-center cursor-pointer transition-all hover:shadow-lg group ${tierFilter === s.name ? 'border-primary-500 ring-4 ring-primary-50' : 'border-gray-100 hover:border-gray-200'}`}
          >
            <span className="text-3xl block mb-2 transition-transform group-hover:scale-110">{s.icon}</span>
            <p className="font-extrabold text-sm text-gray-900">{s.name}</p>
            <div 
              className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm"
              style={{ backgroundColor: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }}
            >
              {s.count} Thành viên
            </div>
            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">Giảm {s.discount}%</p>
            <p className="text-[10px] text-gray-300 mt-0.5 tracking-tight">từ {s.minPoints.toLocaleString('vi-VN')} điểm</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Tìm theo tên, email, số điện thoại..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm w-full focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" 
            />
          </div>
        </div>
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/50 sticky top-0 z-10">
              <tr>
                {['Thành viên', 'Hạng', 'Tổng chi tiêu', 'Điểm tích lũy', 'Đơn hàng', 'Ngày tham gia', 'Thao tác'].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" /></td></tr>
              ) : filteredUsers.map(u => (
                <tr key={u._id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-xs shrink-0 uppercase transition-transform group-hover:scale-105 overflow-hidden">
                        {u.avatar ? (
                          <img src={u.avatar.startsWith('http') ? u.avatar : `${BACKEND}${u.avatar}`} className="w-full h-full object-cover" alt="" />
                        ) : u.name.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate">{u.name}</p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200 uppercase tracking-tight">
                      {data?.summary.find(s => s.name === u.tier)?.icon} {u.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-extrabold text-gray-900 whitespace-nowrap">{u.totalSpent.toLocaleString('vi-VN')}₫</td>
                  <td className="px-6 py-4 font-bold text-primary-600">{u.points.toLocaleString('vi-VN')}</td>
                  <td className="px-6 py-4 text-center font-bold text-gray-700">{u.orderCount}</td>
                  <td className="px-6 py-4 text-gray-400 whitespace-nowrap font-medium text-xs">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => setPointTarget(u)} className="p-2 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white transition-all transform active:scale-90" title="Cộng/Trừ điểm"><Gift className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(u)} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition-all transform active:scale-90"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && !loading && (
                <tr><td colSpan={7} className="px-6 py-20 text-center text-gray-400 font-medium">Không tìm thấy thành viên nào phù hợp</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showSettings && <TierSettingsModal tiers={data?.tiers || []} onClose={t => { if (t) setData(prev => prev ? { ...prev, tiers: t } : null); setShowSettings(false); }} />}
      {pointTarget && <PointModal member={pointTarget} onClose={() => setPointTarget(null)} onUpdate={onUpdatePoints} />}
      {deleteTarget && (
        <DeleteConfirmModal 
          title="Xóa hội viên" 
          message={`Hành động này sẽ xóa vĩnh viễn tài khoản của "${deleteTarget.name}". Bạn có chắc chắn?`} 
          onConfirm={handleDelete} 
          onClose={() => setDeleteTarget(null)} 
        />
      )}
    </div>
  );
};

export default AdminMembership;
