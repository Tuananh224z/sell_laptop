import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, X, Eye, EyeOff, ToggleLeft, ToggleRight, KeyRound, RefreshCw } from 'lucide-react';
import api from '../../config/Axios';
import DeleteConfirmModal from './DeleteConfirmModal';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

interface User {
  _id: string; id?: string; name: string; email: string; phone: string;
  role: 'user' | 'admin'; isActive: boolean; createdAt: string; initials: string;
  avatar?: string;
}

/* ─── User Form Modal (Create / Edit) ─── */
const UserModal = ({
  user, onClose, onSaved,
}: { user: User | null; onClose: () => void; onSaved: () => void }) => {
  const isEdit = !!user;
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    role: user?.role ?? 'user',
    password: '',
    isActive: user?.isActive ?? true,
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setError('');
    if (!form.name || !form.email) { setError('Vui lòng điền đầy đủ thông tin'); return; }
    if (!isEdit && !form.password) { setError('Vui lòng nhập mật khẩu'); return; }
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/users/${user!._id}`, { name: form.name, phone: form.phone, role: form.role, isActive: form.isActive });
      } else {
        await api.post('/users', { name: form.name, email: form.email, phone: form.phone, password: form.password, role: form.role });
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-extrabold text-gray-900">{isEdit ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl">{error}</div>}
          {[
            { label: 'Họ và tên *', key: 'name', type: 'text', placeholder: 'Nguyễn Văn A' },
            { label: 'Email *', key: 'email', type: 'email', placeholder: 'user@example.com', disabled: isEdit },
            { label: 'Số điện thoại', key: 'phone', type: 'tel', placeholder: '0912 345 678' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">{f.label}</label>
              <input type={f.type} value={form[f.key as keyof typeof form] as string} onChange={e => set(f.key, e.target.value)}
                disabled={f.disabled} placeholder={f.placeholder}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-100 disabled:text-gray-400" />
            </div>
          ))}

          {!isEdit && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Mật khẩu *</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                  placeholder="Ít nhất 6 ký tự"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Vai trò</label>
              <select value={form.role} onChange={e => set('role', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                <option value="user">Người dùng</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {isEdit && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Trạng thái</label>
                <select value={String(form.isActive)} onChange={e => set('isActive', e.target.value === 'true')}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                  <option value="true">Hoạt động</option>
                  <option value="false">Đã khóa</option>
                </select>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <button onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Huỷ</button>
          <button onClick={save} disabled={loading}
            className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2">
            {loading && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
            {isEdit ? 'Lưu thay đổi' : 'Tạo người dùng'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Reset Password Modal ─── */
const ResetPasswordModal = ({ user, onClose }: { user: User; onClose: () => void }) => {
  const [pwd, setPwd] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (pwd.length < 6) { setError('Mật khẩu phải ít nhất 6 ký tự'); return; }
    setLoading(true); setError('');
    try {
      await api.patch(`/users/${user._id}/reset-password`, { newPassword: pwd });
      setSuccess(true);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Lỗi');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900">Đặt lại mật khẩu</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-6 space-y-4">
          {success ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"><KeyRound className="w-7 h-7 text-green-600" /></div>
              <p className="font-semibold text-gray-900">Đặt lại mật khẩu thành công!</p>
              <p className="text-sm text-gray-500 mt-1">Mật khẩu mới đã được cập nhật cho <strong>{user.name}</strong></p>
              <button onClick={onClose} className="mt-4 bg-primary-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold">Đóng</button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600">Đặt lại mật khẩu cho: <strong>{user.name}</strong></p>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-xl">{error}</div>}
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={pwd} onChange={e => setPwd(e.target.value)}
                  placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700">Huỷ</button>
                <button onClick={save} disabled={loading || !pwd}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white rounded-xl py-2.5 text-sm font-semibold">
                  {loading ? 'Đang lưu...' : 'Xác nhận'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Main ─── */
const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [editUser, setEditUser] = useState<User | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users', {
        params: { search, role: roleFilter === 'all' ? '' : roleFilter, status: statusFilter === 'all' ? '' : statusFilter, page, limit: 15 },
      });
      setUsers(data.users);
      setTotal(data.total);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [search, roleFilter, statusFilter, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/users/${deleteTarget._id}`);
    setDeleteTarget(null);
    fetchUsers();
  };

  const handleToggle = async (u: User) => {
    setTogglingId(u._id);
    try {
      await api.patch(`/users/${u._id}/toggle`);
      fetchUsers();
    } finally { setTogglingId(null); }
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Quản lý người dùng</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} người dùng</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchUsers} className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors" title="Làm mới">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm">
            <Plus className="w-4 h-4" /> Thêm người dùng
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm tên, email, SĐT..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm min-w-60 focus:ring-1 focus:ring-primary-500 outline-none" />
        </div>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500 outline-none bg-white">
          <option value="all">Tất cả vai trò</option>
          <option value="user">Người dùng</option>
          <option value="admin">Admin</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500 outline-none bg-white">
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Đã khóa</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Đang tải...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Người dùng', 'Vai trò', 'Số điện thoại', 'Ngày tạo', 'Trạng thái', 'Thao tác'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-16 text-gray-400">Không tìm thấy người dùng</td></tr>
                ) : users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                          {u.avatar ? (
                            <img src={u.avatar.startsWith('http') ? u.avatar : `${BACKEND}${u.avatar}`} className="w-full h-full object-cover" alt="" />
                          ) : (
                            u.initials || u.name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.role === 'admin' ? 'Admin' : 'Người dùng'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{u.phone || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap text-xs">
                      {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {u.isActive ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditUser(u)} title="Chỉnh sửa" className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleToggle(u)} title={u.isActive ? 'Khóa tài khoản' : 'Kích hoạt'} disabled={togglingId === u._id}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-500 transition-colors">
                          {u.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setResetTarget(u)} title="Đặt lại mật khẩu" className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-500 transition-colors"><KeyRound className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteTarget(u)} title="Xóa" className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Hiển thị {users.length}/{total} người dùng</p>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${page === p ? 'bg-primary-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showCreate && <UserModal user={null} onClose={() => setShowCreate(false)} onSaved={fetchUsers} />}
      {editUser    && <UserModal user={editUser} onClose={() => setEditUser(null)} onSaved={fetchUsers} />}
      {resetTarget && <ResetPasswordModal user={resetTarget} onClose={() => setResetTarget(null)} />}
      {deleteTarget && (
        <DeleteConfirmModal
          title="Xóa người dùng"
          message={`Xác nhận xóa người dùng "${deleteTarget.name}"? Hành động này không thể hoàn tác.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default AdminUsers;
