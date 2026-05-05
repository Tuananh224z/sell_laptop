import { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../lib/api';

const PasswordField = ({
  label, field, value, hint, show, setShow, setForm, form
}: {
  label: string;
  field: 'current' | 'newPass' | 'confirm';
  value: string;
  hint?: string;
  show: any;
  setShow: any;
  setForm: any;
  form: any;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Lock className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type={show[field] ? 'text' : 'password'}
        required value={value}
        onChange={e => setForm({ ...form, [field]: e.target.value })}
        placeholder="••••••••"
        className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 focus:bg-white transition-colors"
      />
      <button type="button" onClick={() => setShow({ ...show, [field]: !show[field] })}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
        {show[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

const ProfileChangePassword = () => {
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Password strength
  const strength = (() => {
    const p = form.newPass;
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();
  const strengthLabel = ['', 'Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'][strength] || '';
  const strengthColor = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-500', 'bg-green-500'][strength] || 'bg-gray-200';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.newPass !== form.confirm) { setError('Mật khẩu mới không khớp!'); return; }
    if (form.newPass.length < 6) { setError('Mật khẩu mới phải có ít nhất 6 ký tự!'); return; }
    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: form.current,
        newPassword: form.newPass,
      });
      setSuccess('Đổi mật khẩu thành công!');
      setForm({ current: '', newPass: '', confirm: '' });
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
      <div className="mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Đổi mật khẩu</h2>
        <p className="text-sm text-gray-500 mt-1">Đảm bảo tài khoản của bạn luôn được bảo mật</p>
      </div>

      <div className="max-w-md">
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <PasswordField 
            label="Mật khẩu hiện tại" 
            field="current" 
            value={form.current} 
            show={show} 
            setShow={setShow} 
            setForm={setForm} 
            form={form} 
          />
          <PasswordField 
            label="Mật khẩu mới" 
            field="newPass" 
            value={form.newPass} 
            show={show} 
            setShow={setShow} 
            setForm={setForm} 
            form={form} 
          />

          {/* Strength bar */}
          {form.newPass && (
            <div>
              <div className="flex gap-1 mb-1">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-gray-200'}`} />
                ))}
              </div>
              <p className={`text-xs font-semibold ${strengthColor.replace('bg-', 'text-')}`}>{strengthLabel}</p>
            </div>
          )}

          <PasswordField 
            label="Xác nhận mật khẩu mới" 
            field="confirm" 
            value={form.confirm}
            show={show} 
            setShow={setShow} 
            setForm={setForm} 
            form={form} 
            hint={form.confirm && form.newPass !== form.confirm ? '⚠️ Mật khẩu chưa khớp' : undefined} 
          />

          {/* Security hints */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-blue-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Yêu cầu mật khẩu mạnh
            </p>
            <ul className="space-y-1">
              {[
                { text: 'Ít nhất 6 ký tự', ok: form.newPass.length >= 6 },
                { text: 'Bao gồm chữ hoa và chữ thường', ok: /[A-Z]/.test(form.newPass) && /[a-z]/.test(form.newPass) },
                { text: 'Bao gồm ít nhất 1 số', ok: /[0-9]/.test(form.newPass) },
                { text: 'Không trùng với mật khẩu cũ', ok: false },
              ].map(({ text, ok }) => (
                <li key={text} className={`text-xs flex items-center gap-1.5 ${ok ? 'text-green-600' : 'text-blue-600'}`}>
                  {ok ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-1 h-1 rounded-full bg-blue-400 inline-block shrink-0" />}
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-2.5 px-8 rounded-lg shadow-sm transition-colors flex items-center gap-2">
              {loading && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
              {loading ? 'Đang lưu...' : 'Xác nhận đổi mật khẩu'}
            </button>
            <button type="button" onClick={() => { setForm({ current: '', newPass: '', confirm: '' }); setError(''); }}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-6 rounded-lg transition-colors">
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileChangePassword;
