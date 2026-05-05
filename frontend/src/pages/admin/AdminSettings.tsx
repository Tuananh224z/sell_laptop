import { useState, useEffect } from 'react';
import { Save, Loader2, Globe, Phone, Mail, MapPin, CreditCard, Truck, Percent, ExternalLink, ImageIcon } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'react-toastify';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const AdminSettings = () => {
  const [form, setForm] = useState({
    siteName: '',
    phone: '',
    email: '',
    address: '',
    zalo: '',
    zaloUrl: '',
    messenger: '',
    facebook: '',
    shippingFee: 0,
    taxRate: 0,
    freeShipThreshold: 0,
    logo: '',
    banner1: '',
    banner1Title: '',
    banner1Sub: '',
    banner2: '',
    banner2Title: '',
    banner2Sub: '',
    banner3: '',
    banner3Title: '',
    banner3Sub: ''
  });
  const [files, setFiles] = useState<Record<string, File>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      setForm(prev => ({
        ...prev,
        ...data
      }));
    } catch (err) {
      toast.error('Lỗi tải cài đặt');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [field]: e.target.files![0] }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (typeof val === 'number') formData.append(key, val.toString());
        else formData.append(key, val as string);
      });
      Object.entries(files).forEach(([key, file]) => {
        formData.append(key, file);
      });

      await api.put('/settings/admin', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Đã lưu cấu hình hệ thống');
      fetchSettings();
      setFiles({}); // Reset files after save
    } catch (err) {
      toast.error('Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary-500" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Cấu hình hệ thống</h1>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý thông tin liên hệ, mạng xã hội và chính sách cửa hàng</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-2.5 rounded-2xl transition-all shadow-lg shadow-primary-100 active:scale-95"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-5 h-5" />}
          Lưu cấu hình
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Contact & Social */}
        <div className="md:col-span-2 space-y-6">
          {/* General Info */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary-600" />
              <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Thông tin chung</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Tên Website</label>
                <input value={form.siteName} onChange={e => setForm({...form, siteName: e.target.value})} className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary-500/10 outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Email hỗ trợ</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary-500/10 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Số điện thoại</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary-500/10 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Địa chỉ</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary-500/10 outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Interface & Images */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary-600" />
              <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Giao diện & Hình ảnh</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Logo Section */}
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-full sm:w-1/3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Logo Website</label>
                  <div className="aspect-[3/1] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group">
                    {files.logo ? (
                      <img src={URL.createObjectURL(files.logo)} className="w-full h-full object-contain p-4" alt="Preview" />
                    ) : form.logo ? (
                      <img src={`${BACKEND}${form.logo}`} className="w-full h-full object-contain p-4" alt="Logo" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    )}
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-xs font-bold">
                      Thay đổi Logo
                      <input type="file" className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'logo')} />
                    </label>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 leading-relaxed mt-6 italic">
                    * Khuyên dùng: Ảnh trong suốt (PNG), kích thước 300x100px. Logo sẽ hiển thị trên Header và Footer của Website.
                  </p>
                </div>
              </div>

              {/* Banners Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-50">
                {[
                  { id: 'banner1', label: 'Banner Chính (Lớn)', desc: '800x400px' },
                  { id: 'banner2', label: 'Banner Phụ 1', desc: '400x200px' },
                  { id: 'banner3', label: 'Banner Phụ 2', desc: '400x200px' },
                ].map(b => (
                  <div key={b.id}>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">{b.label}</label>
                    <div className="aspect-[2/1] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group">
                      {files[b.id] ? (
                        <img src={URL.createObjectURL(files[b.id])} className="w-full h-full object-cover" alt="Preview" />
                      ) : (form as any)[b.id] ? (
                        <img src={`${BACKEND}${(form as any)[b.id]}`} className="w-full h-full object-cover" alt={b.id} />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-300" />
                      )}
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-xs font-bold">
                        Tải lên
                        <input type="file" className="hidden" accept="image/*" onChange={e => handleFileChange(e, b.id)} />
                      </label>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 text-center">Kích thước khuyên dùng: {b.desc}</p>
                    <div className="mt-3 space-y-2">
                       <input 
                         value={(form as any)[`${b.id}Title`]} 
                         onChange={e => setForm({...form, [`${b.id}Title`]: e.target.value})}
                         placeholder="Tiêu đề banner..."
                         className="w-full border border-gray-100 rounded-xl px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-primary-500/10 outline-none"
                       />
                       <input 
                         value={(form as any)[`${b.id}Sub`]} 
                         onChange={e => setForm({...form, [`${b.id}Sub`]: e.target.value})}
                         placeholder="Mô tả ngắn..."
                         className="w-full border border-gray-100 rounded-xl px-3 py-1.5 text-[10px] font-medium focus:ring-2 focus:ring-primary-500/10 outline-none"
                       />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Policies */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary-600" />
              <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Giao hàng & Thuế</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Phí vận chuyển mặc định (₫)</label>
                <input type="number" value={form.shippingFee} onChange={e => setForm({...form, shippingFee: Number(e.target.value)})} className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-primary-600 focus:ring-2 focus:ring-primary-500/10 outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Ngưỡng miễn phí ship (₫)</label>
                <input type="number" value={form.freeShipThreshold} onChange={e => setForm({...form, freeShipThreshold: Number(e.target.value)})} className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-green-600 focus:ring-2 focus:ring-primary-500/10 outline-none" />
                <p className="text-[10px] text-gray-400 mt-2 font-medium">Đơn hàng trên mức này sẽ được FreeShip</p>
              </div>
              <div className="pt-4 border-t border-gray-50">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Thuế VAT (%)</label>
                <div className="relative">
                  <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="number" value={form.taxRate} onChange={e => setForm({...form, taxRate: Number(e.target.value)})} className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-red-600 focus:ring-2 focus:ring-primary-500/10 outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tip */}
          <div className="bg-primary-600 rounded-3xl p-6 text-white shadow-xl shadow-primary-100">
            <Globe className="w-8 h-8 mb-4 opacity-50" />
            <h3 className="font-bold text-lg mb-2">Thông tin hiển thị</h3>
            <p className="text-primary-100 text-xs leading-relaxed">
              Các thông tin này sẽ được hiển thị công khai ở chân trang (Footer), trang liên hệ và trong quá trình thanh toán (Checkout) của khách hàng. Hãy đảm bảo thông tin luôn chính xác.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
