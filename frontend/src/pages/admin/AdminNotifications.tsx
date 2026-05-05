import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Send, Bell, Smartphone, Mail, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'react-toastify';
import DeleteConfirmModal from './DeleteConfirmModal';

interface Notif {
  _id: string;
  title: string;
  content: string;
  type: 'all' | 'tier' | 'user';
  targetTier?: string;
  targetUser?: { _id: string; name: string; email: string };
  channels: ('push' | 'email' | 'sms')[];
  status: 'draft' | 'scheduled' | 'sent';
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
}

const statusStyle: Record<string, string> = {
  sent:      'bg-green-100 text-green-700',
  scheduled: 'bg-blue-100 text-blue-700',
  draft:     'bg-gray-100 text-gray-500',
};

/* ─── Notification Modal ─── */
const NotifModal = ({ notif, onClose, onSaved }: { notif: Partial<Notif> | null; onClose: () => void; onSaved: () => void }) => {
  const isNew = !notif?._id;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: notif?.title ?? '',
    content: notif?.content ?? '',
    type: notif?.type ?? 'all',
    targetTier: notif?.targetTier ?? '',
    targetUser: notif?.targetUser?._id ?? '',
    channels: notif?.channels ?? ['push'],
    status: notif?.status ?? 'draft',
    scheduledAt: notif?.scheduledAt ? new Date(notif.scheduledAt).toISOString().slice(0, 16) : '',
  });

  const toggleChannel = (c: 'push' | 'email' | 'sms') =>
    setForm(f => ({ ...f, channels: f.channels.includes(c) ? f.channels.filter(x => x !== c) : [...f.channels, c] }));

  const handleSave = async () => {
    if (!form.title || !form.content) return toast.error('Vui lòng điền đủ tiêu đề và nội dung');
    setLoading(true);
    try {
      if (isNew) {
        await api.post('/notifications/admin', form);
      } else {
        await api.put(`/notifications/admin/${notif?._id}`, form);
      }
      toast.success('Đã lưu thông báo');
      onSaved();
      onClose();
    } catch (err) {
      toast.error('Lỗi khi lưu thông báo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">{isNew ? 'Tạo thông báo mới' : 'Chỉnh sửa thông báo'}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Phát sóng thông báo đến người dùng</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Tiêu đề thông báo *</label>
            <input 
              value={form.title} 
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" 
              placeholder="Nhập tiêu đề..." 
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Nội dung chi tiết *</label>
            <textarea 
              rows={4} 
              value={form.content} 
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))} 
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary-500/20 outline-none resize-none transition-all" 
              placeholder="Nội dung thông báo hiển thị cho người dùng..." 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Đối tượng nhận</label>
              <select 
                value={form.type} 
                onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold bg-white outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
              >
                <option value="all">Tất cả người dùng</option>
                <option value="tier">Theo hạng thành viên</option>
                <option value="user">Người dùng cụ thể</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Kênh gửi</label>
              <div className="flex gap-2">
                {[{k: 'push', i: Bell}, {k: 'email', i: Mail}, {k: 'sms', i: Smartphone}].map(({k, i: Icon}) => (
                  <button 
                    key={k} 
                    onClick={() => toggleChannel(k as any)} 
                    className={`flex-1 h-11 rounded-xl flex items-center justify-center transition-all ${form.channels.includes(k as any) ? 'bg-primary-600 text-white shadow-lg shadow-primary-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                    title={k}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {form.type === 'tier' && (
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Chọn hạng thành viên</label>
              <select value={form.targetTier} onChange={e => setForm(f => ({ ...f, targetTier: e.target.value }))} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold bg-white outline-none">
                <option value="Đồng">Đồng</option>
                <option value="Bạc">Bạc</option>
                <option value="Vàng">Vàng</option>
                <option value="Bạch kim">Bạch kim</option>
                <option value="Kim cương">Kim cương</option>
              </select>
            </div>
          )}

          {form.type === 'user' && (
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">ID Người dùng</label>
              <input value={form.targetUser} onChange={e => setForm(f => ({ ...f, targetUser: e.target.value }))} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-primary-500/20 outline-none" placeholder="Nhập ID người dùng..." />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Trạng thái</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold bg-white outline-none">
                <option value="draft">Lưu nháp</option>
                <option value="scheduled">Lên lịch gửi</option>
                <option value="sent">Gửi ngay</option>
              </select>
            </div>
            {form.status === 'scheduled' && (
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Thời gian gửi</label>
                <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none" />
              </div>
            )}
          </div>
        </div>
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex gap-4">
          <button onClick={onClose} className="flex-1 bg-white border border-gray-200 rounded-2xl py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">Huỷ bỏ</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl py-3 text-sm font-bold shadow-xl shadow-primary-200 transition-all flex items-center justify-center gap-2 active:scale-95">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {form.status === 'sent' ? 'Gửi ngay' : 'Lưu thông báo'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main ─── */
const AdminNotifications = () => {
  const [data, setData] = useState<{ notifications: Notif[], summary: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState<Partial<Notif> | null | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Notif | null>(null);

  const fetchNotifs = async () => {
    try {
      const { data } = await api.get('/notifications/admin/all', {
        params: { status: statusFilter, search }
      });
      setData(data);
    } catch (err) {
      toast.error('Lỗi tải danh sách thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [statusFilter, search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/notifications/admin/${deleteTarget._id}`);
      toast.success('Đã xoá thông báo');
      fetchNotifs();
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Xoá thất bại');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Quản lý thông báo</h1>
          <p className="text-sm text-gray-500 mt-0.5">Phát sóng tin tức và cập nhật đến khách hàng</p>
        </div>
        <button onClick={() => setModal({})} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-2.5 rounded-2xl transition-all text-sm shadow-lg shadow-primary-100 active:scale-95">
          <Plus className="w-5 h-5" /> Tạo thông báo
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Đã gửi', value: data?.summary.sent ?? 0, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Lên lịch', value: data?.summary.scheduled ?? 0, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Nháp', value: data?.summary.draft ?? 0, color: 'text-gray-500', bg: 'bg-gray-50' },
          { label: 'Tổng', value: data?.summary.total ?? 0, color: 'text-gray-900', bg: 'bg-primary-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 text-center group hover:border-primary-100 transition-all">
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30 flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Tìm kiếm tiêu đề, nội dung..." 
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-2xl text-sm w-full focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" 
            />
          </div>
          <div className="flex gap-1.5 bg-gray-100 p-1 rounded-2xl">
            {['all', 'sent', 'scheduled', 'draft'].map(f => (
              <button 
                key={f} 
                onClick={() => setStatusFilter(f)} 
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === f ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {f === 'all' ? 'Tất cả' : f === 'sent' ? 'Đã gửi' : f === 'scheduled' ? 'Lên lịch' : 'Nháp'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="divide-y divide-gray-50 flex-1 custom-scrollbar">
          {loading ? (
            <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary-500" /></div>
          ) : data?.notifications.length === 0 ? (
            <div className="py-20 text-center text-gray-400 font-medium">Không tìm thấy thông báo nào</div>
          ) : data?.notifications.map(n => (
            <div key={n._id} className="px-6 py-5 hover:bg-gray-50/70 transition-all flex items-start gap-5 group">
              <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                <Bell className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <p className="font-extrabold text-gray-900 text-sm group-hover:text-primary-600 transition-colors">{n.title}</p>
                  <span className={`text-[9px] font-bold px-3 py-1 rounded-full shrink-0 uppercase tracking-tighter ${statusStyle[n.status]}`}>
                    {n.status === 'sent' ? 'Đã gửi' : n.status === 'scheduled' ? 'Lên lịch' : 'Nháp'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-1 font-medium">{n.content}</p>
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <div className="flex gap-1.5">
                    {n.channels.map(c => (
                      <span key={c} className="text-[9px] bg-white border border-gray-100 text-gray-500 px-2 py-1 rounded-lg font-bold uppercase flex items-center gap-1">
                        {c === 'push' ? <Bell className="w-2.5 h-2.5" /> : c === 'email' ? <Mail className="w-2.5 h-2.5" /> : <Smartphone className="w-2.5 h-2.5" />}
                        {c}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                    {n.type === 'all' ? '👥 Tất cả' : n.type === 'tier' ? `👑 ${n.targetTier}` : `🎯 ${n.targetUser?.name || 'Cụ thể'}`}
                  </span>
                  {n.sentAt && <span className="text-[10px] text-gray-300 font-bold uppercase tracking-tight">✓ Gửi lúc {new Date(n.sentAt).toLocaleString('vi-VN')}</span>}
                  {n.status === 'scheduled' && n.scheduledAt && <span className="text-[10px] text-blue-500 font-bold uppercase tracking-tight">⏳ Lên lịch {new Date(n.scheduledAt).toLocaleString('vi-VN')}</span>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setModal(n)} className="p-2.5 rounded-xl hover:bg-amber-50 text-amber-500 transition-all transform active:scale-90"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => setDeleteTarget(n)} className="p-2.5 rounded-xl hover:bg-red-50 text-red-500 transition-all transform active:scale-90"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal !== undefined && <NotifModal notif={modal} onClose={() => setModal(undefined)} onSaved={fetchNotifs} />}
      {deleteTarget && (
        <DeleteConfirmModal 
          title="Xóa thông báo" 
          message={`Hành động này sẽ xóa vĩnh viễn thông báo "${deleteTarget.title}". Bạn có chắc chắn?`} 
          onConfirm={handleDelete} 
          onClose={() => setDeleteTarget(null)} 
        />
      )}
    </div>
  );
};

export default AdminNotifications;
