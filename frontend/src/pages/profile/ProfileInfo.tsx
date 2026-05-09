import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Camera, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
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

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const ProfileInfo = () => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    gender: user?.gender ?? 'male',
    dob: user?.dob ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load địa chỉ mặc định
  useEffect(() => {
    api.get('/addresses').then(res => {
      const def = res.data.find((a: Address) => a.isDefault) || res.data[0] || null;
      setDefaultAddress(def);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      const { data } = await api.put('/auth/profile', profile);
      setUser(data.user);
      setSuccess('Cập nhật thông tin thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      setError('Ảnh quá lớn. Tối đa 1MB.');
      return;
    }

    setUploading(true); setError('');
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser(data.user);
      setSuccess('Cập nhật ảnh đại diện thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Upload thất bại');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'NA';

  const avatarSrc = user?.avatar
    ? (user.avatar.startsWith('http') ? user.avatar : `${BACKEND}${user.avatar}`)
    : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
      <div className="mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Hồ sơ của tôi</h2>
        <p className="text-sm text-gray-500 mt-1">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />{success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Form */}
        <div className="lg:w-2/3">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name */}
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="col-span-1 text-sm font-medium text-gray-700 text-right pr-4">Họ và tên</label>
              <div className="col-span-2">
                <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500" />
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="col-span-1 text-sm font-medium text-gray-700 text-right pr-4">Email</label>
              <div className="col-span-2 flex items-center gap-3">
                <span className="text-sm font-medium text-gray-900">{user?.email}</span>
                {user?.isVerified ? (
                  <span className="flex items-center gap-1 text-xs text-green-600 font-semibold bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Đã xác thực
                  </span>
                ) : (
                  <Link to="/verify" className="text-xs text-orange-600 underline">Xác thực ngay</Link>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="col-span-1 text-sm font-medium text-gray-700 text-right pr-4">Số điện thoại</label>
              <div className="col-span-2">
                <input type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="0912 345 678"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500" />
              </div>
            </div>

            {/* Gender */}
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="col-span-1 text-sm font-medium text-gray-700 text-right pr-4">Giới tính</label>
              <div className="col-span-2 flex items-center gap-6">
                {[{ v: 'male', l: 'Nam' }, { v: 'female', l: 'Nữ' }, { v: 'other', l: 'Khác' }].map(({ v, l }) => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="gender" value={v} checked={profile.gender === v}
                      onChange={() => setProfile({ ...profile, gender: v })}
                      className="text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm text-gray-700">{l}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* DOB */}
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="col-span-1 text-sm font-medium text-gray-700 text-right pr-4">Ngày sinh</label>
              <div className="col-span-2">
                <input type="date" value={profile.dob} onChange={e => setProfile({ ...profile, dob: e.target.value })}
                  className="w-full max-w-[200px] border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-gray-700" />
              </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-4 pt-4">
              <div className="col-span-1" />
              <div className="col-span-2">
                <button type="submit" disabled={saving}
                  className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-2.5 px-8 rounded-lg shadow-sm transition-colors flex items-center gap-2">
                  {saving && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </form>

          {/* Default Address — load từ API */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Địa chỉ giao hàng mặc định</h3>
              <Link to="/profile/addresses" className="text-xs text-primary-600 font-medium hover:underline">Quản lý địa chỉ</Link>
            </div>

            {defaultAddress ? (
              <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <MapPin className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-gray-900">{defaultAddress.name}</span>
                    <span className="text-gray-400 text-xs">|</span>
                    <span className="text-sm text-gray-600">{defaultAddress.phone}</span>
                    <span className="text-xs font-semibold text-primary-600 border border-primary-300 bg-primary-50 px-2 py-0.5 rounded">Mặc định</span>
                  </div>
                  <p className="text-sm text-gray-600">{defaultAddress.address}</p>
                  <p className="text-sm text-gray-600">
                    {[defaultAddress.ward, defaultAddress.district, defaultAddress.city].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 text-gray-400">
                <MapPin className="w-5 h-5" />
                <span className="text-sm">Chưa có địa chỉ mặc định. </span>
                <Link to="/profile/addresses" className="text-sm text-primary-600 underline">Thêm ngay</Link>
              </div>
            )}
          </div>
        </div>

        {/* Avatar */}
        <div className="lg:w-1/3 flex flex-col items-center justify-start border-l border-gray-100 pl-10 border-t lg:border-t-0 pt-8 lg:pt-0">
          <div className="relative group w-28 h-28 mb-4">
            <div className="w-28 h-28 bg-primary-50 rounded-full border-2 border-gray-200 flex items-center justify-center overflow-hidden">
              {uploading ? (
                <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
              ) : avatarSrc ? (
                <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl text-primary-400 font-bold uppercase">{initials}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-9 h-9 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
            <input
              ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
              className="hidden" onChange={handleAvatarChange}
            />
          </div>
          <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
          <p className="text-xs text-gray-400 mt-4 text-center">
            Dụng lượng tối đa 1 MB<br />Định dạng: .JPEG, .PNG, .WEBP
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
