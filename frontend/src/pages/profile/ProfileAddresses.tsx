import { useState, useEffect } from 'react';
import { MapPin, Plus, Pencil, Trash2, X, CheckCircle2, AlertCircle, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../config/Axios';

interface Address {
  _id: string;
  name: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}

const EMPTY_FORM = { name: '', phone: '', address: '', ward: '', district: '', city: '', isDefault: false };

/* ─── Address Form Modal ─── */
const AddressModal = ({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Address | null;
  onClose: () => void;
  onSaved: (addr: Address) => void;
}) => {
  const [form, setForm] = useState(initial
    ? { name: initial.name, phone: initial.phone, address: initial.address, ward: initial.ward, district: initial.district, city: initial.city, isDefault: initial.isDefault }
    : EMPTY_FORM
  );
  
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch('https://provinces.open-api.vn/api/p/');
        const data = await res.json();
        setProvinces(data);
      } catch (err) {
        console.error('Failed to fetch provinces', err);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch districts when city (province) changes
  useEffect(() => {
    if (!form.city) {
      setDistricts([]);
      return;
    }
    const province = provinces.find(p => p.name === form.city);
    if (!province) return;

    const fetchDistricts = async () => {
      try {
        setFetching(true);
        const res = await fetch(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`);
        const data = await res.json();
        setDistricts(data.districts || []);
      } catch (err) {
        console.error('Failed to fetch districts', err);
      } finally {
        setFetching(false);
      }
    };
    fetchDistricts();
  }, [form.city, provinces]);

  // Fetch wards when district changes
  useEffect(() => {
    if (!form.district) {
      setWards([]);
      return;
    }
    const district = districts.find(d => d.name === form.district);
    if (!district) return;

    const fetchWards = async () => {
      try {
        setFetching(true);
        const res = await fetch(`https://provinces.open-api.vn/api/d/${district.code}?depth=2`);
        const data = await res.json();
        setWards(data.wards || []);
      } catch (err) {
        console.error('Failed to fetch wards', err);
      } finally {
        setFetching(false);
      }
    };
    fetchWards();
  }, [form.district, districts]);

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.city || !form.district || !form.ward) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    setLoading(true); setError('');
    try {
      const { data } = initial
        ? await api.put(`/addresses/${initial._id}`, form)
        : await api.post('/addresses', form);
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900 text-base">
            {initial ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
              <input value={form.name} onChange={e => set('name', e.target.value)} type="text"
                placeholder="Nguyễn Văn A"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} type="tel"
                placeholder="09xx xxx xxx"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ cụ thể <span className="text-red-500">*</span></label>
            <input value={form.address} onChange={e => set('address', e.target.value)} type="text"
              placeholder="Số nhà, tên đường..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố <span className="text-red-500">*</span></label>
              <select 
                value={form.city} 
                onChange={e => {
                  setForm(f => ({ ...f, city: e.target.value, district: '', ward: '' }));
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                <option value="">Chọn Tỉnh/TP</option>
                {provinces.map(p => (
                  <option key={p.code} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
            <div 
              onClick={() => {
                if (!form.city) toast.info('Vui lòng chọn Tỉnh/Thành phố trước');
              }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện <span className="text-red-500">*</span></label>
              <select 
                value={form.district} 
                disabled={!form.city || fetching}
                onChange={e => {
                  setForm(f => ({ ...f, district: e.target.value, ward: '' }));
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="">Chọn Quận/Huyện</option>
                {districts.map(d => (
                  <option key={d.code} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
            <div
              onClick={() => {
                if (!form.district) toast.info('Vui lòng chọn Quận/Huyện trước');
              }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã <span className="text-red-500">*</span></label>
              <select 
                value={form.ward} 
                disabled={!form.district || fetching}
                onChange={e => set('ward', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="">Chọn Phường/Xã</option>
                {wards.map(w => (
                  <option key={w.code} value={w.name}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input type="checkbox" checked={form.isDefault} onChange={e => set('isDefault', e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
            <span className="text-sm text-gray-700">Đặt làm địa chỉ mặc định</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              Hủy
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
              {loading && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
              {loading ? 'Đang lưu...' : 'Lưu địa chỉ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── ProfileAddresses ─── */
const ProfileAddresses = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Address | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    api.get('/addresses').then(res => setAddresses(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const openAdd = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (addr: Address) => { setEditTarget(addr); setModalOpen(true); };

  const handleSaved = (saved: Address) => {
    setAddresses(prev => {
      let list = editTarget
        ? prev.map(a => a._id === saved._id ? saved : a)
        : [...prev, saved];
      // Nếu saved.isDefault → reset isDefault các cái còn lại
      if (saved.isDefault) list = list.map(a => ({ ...a, isDefault: a._id === saved._id }));
      return list.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
    });
    setModalOpen(false);
    showToast(editTarget ? 'Đã cập nhật địa chỉ!' : 'Đã thêm địa chỉ mới!');
  };

  const handleSetDefault = async (addr: Address) => {
    try {
      await api.patch(`/addresses/${addr._id}/default`);
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: a._id === addr._id })));
      showToast('Đã đặt làm địa chỉ mặc định!');
    } catch { /**/ }
  };

  const handleDelete = async (addr: Address) => {
    if (!confirm(`Xóa địa chỉ của ${addr.name}?`)) return;
    try {
      await api.delete(`/addresses/${addr._id}`);
      setAddresses(prev => prev.filter(a => a._id !== addr._id));
      showToast('Đã xóa địa chỉ!');
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Không thể xóa');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-green-600 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">
          <CheckCircle2 className="w-4 h-4" />{toast}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Địa chỉ của tôi</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý địa chỉ giao hàng ({addresses.length} địa chỉ)</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors">
          <Plus className="w-4 h-4" />
          Thêm địa chỉ
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <svg className="animate-spin w-8 h-8 text-primary-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
      )}

      {/* List */}
      {!loading && (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div key={addr._id}
              className={`border rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-4 transition-colors ${addr.isDefault ? 'border-primary-300 bg-primary-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className="flex gap-3">
                <MapPin className={`w-5 h-5 shrink-0 mt-0.5 ${addr.isDefault ? 'text-primary-600' : 'text-gray-400'}`} />
                <div>
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <span className="font-bold text-gray-900">{addr.name}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-600 text-sm">{addr.phone}</span>
                    {addr.isDefault && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-primary-600 border border-primary-300 bg-primary-50 px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3 fill-current" /> Mặc định
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{addr.address}</p>
                  <p className="text-sm text-gray-500">
                    {[addr.ward, addr.district, addr.city].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
              <div className="flex items-start sm:items-center gap-1 shrink-0 flex-wrap">
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr)}
                    className="text-xs text-primary-600 hover:underline font-medium px-2 py-1">
                    Đặt mặc định
                  </button>
                )}
                <button onClick={() => openEdit(addr)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                {!addr.isDefault && (
                  <button onClick={() => handleDelete(addr)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {addresses.length === 0 && (
            <div className="text-center py-14">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">Chưa có địa chỉ nào</p>
              <p className="text-sm text-gray-400 mt-1">Thêm địa chỉ để đặt hàng nhanh hơn</p>
              <button onClick={openAdd}
                className="mt-4 inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-5 rounded-lg text-sm transition-colors">
                <Plus className="w-4 h-4" /> Thêm ngay
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <AddressModal
          initial={editTarget}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default ProfileAddresses;
