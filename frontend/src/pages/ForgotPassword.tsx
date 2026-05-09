import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Mail, KeyRound, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';
import api from '../config/Axios';

type Step = 'email' | 'otp' | 'newPassword' | 'success';

const ForgotPassword = () => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Step 1: Send OTP ───────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true); setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setStep('otp');
      startCountdown();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Lỗi gửi OTP');
    } finally { setLoading(false); }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Vui lòng nhập đủ 6 chữ số'); return; }
    // OTP sẽ được verify ở step 3 khi call API reset
    setError('');
    setStep('newPassword');
  };

  // ── Step 3: Set new password ──────────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPass.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự'); return; }
    if (newPass !== confirmPass) { setError('Mật khẩu xác nhận không khớp'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp: otp.join(''), newPassword: newPass });
      setStep('success');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'OTP không đúng hoặc đã hết hạn';
      setError(msg);
      if (msg.includes('OTP')) setStep('otp');
    } finally { setLoading(false); }
  };

  // ── Countdown resend ──────────────────────────────────────────────────────
  const startCountdown = () => {
    setCountdown(60);
    const id = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(id); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      startCountdown();
      setOtp(['', '', '', '', '', '']);
    } catch { /**/ }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="bg-primary-600 text-white p-3 rounded-lg font-bold text-2xl leading-none shadow-md">TS</div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {(['email', 'otp', 'newPassword'] as Step[]).map((s, i) => {
            const stepIdx = ['email', 'otp', 'newPassword'].indexOf(step);
            const currentIdx = i;
            const done = stepIdx > currentIdx;
            const active = step === s;
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${done ? 'bg-green-500 text-white' : active ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                {i < 2 && <div className={`w-10 h-0.5 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-2xl border border-gray-100">

          {/* ── Step 1: Email ─────────────────────────────────────────────── */}
          {step === 'email' && (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-8 h-8 text-primary-600" />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900">Quên mật khẩu?</h1>
                <p className="text-sm text-gray-500 mt-2">Nhập email của bạn, chúng tôi sẽ gửi mã xác nhận</p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl">{error}</div>}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-bold py-3 rounded-xl transition-colors shadow">
                  {loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
                </button>
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
                </Link>
              </form>
            </>
          )}

          {/* ── Step 2: OTP ──────────────────────────────────────────────── */}
          {step === 'otp' && (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900">Nhập mã OTP</h1>
                <p className="text-sm text-gray-500 mt-2">
                  Mã 6 chữ số đã được gửi đến <span className="font-semibold text-gray-800">{email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl text-center">{error}</div>}
                {/* OTP boxes */}
                <div className="flex justify-center gap-3">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(idx, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(idx, e)}
                      className="w-11 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all bg-gray-50 focus:bg-white"
                    />
                  ))}
                </div>

                {/* Resend */}
                <div className="text-center text-sm text-gray-500">
                  Không nhận được mã?{' '}
                  {countdown > 0 ? (
                    <span className="font-semibold text-gray-600">Gửi lại sau {countdown}s</span>
                  ) : (
                    <button type="button" onClick={handleResend} className="font-semibold text-primary-600 hover:underline inline-flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" /> Gửi lại OTP
                    </button>
                  )}
                </div>

                <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-colors shadow">
                  Xác nhận mã
                </button>
                <button type="button" onClick={() => setStep('email')} className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Quay lại
                </button>
              </form>
            </>
          )}

          {/* ── Step 3: New Password ─────────────────────────────────────── */}
          {step === 'newPassword' && (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-8 h-8 text-violet-600" />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900">Đặt mật khẩu mới</h1>
                <p className="text-sm text-gray-500 mt-2">Mật khẩu phải có ít nhất 8 ký tự</p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                {[
                  { label: 'Mật khẩu mới', val: newPass, setVal: setNewPass, show: showNew, toggleShow: () => setShowNew(v => !v) },
                  { label: 'Xác nhận mật khẩu', val: confirmPass, setVal: setConfirmPass, show: showConfirm, toggleShow: () => setShowConfirm(v => !v) },
                ].map(field => (
                  <div key={field.label}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={field.show ? 'text' : 'password'}
                        required
                        value={field.val}
                        onChange={e => field.setVal(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 focus:bg-white transition-colors"
                      />
                      <button type="button" onClick={field.toggleShow} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {field.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}

                <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-bold py-3 rounded-xl transition-colors shadow mt-2">
                  {loading ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
                </button>
                <button type="button" onClick={() => setStep('otp')} className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Quay lại nhập mã
                </button>
              </form>
            </>
          )}

          {/* ── Step 4: Success ──────────────────────────────────────────── */}
          {step === 'success' && (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Đặt lại thành công!</h1>
              <p className="text-sm text-gray-500 mb-8">Mật khẩu của bạn đã được cập nhật. Hãy đăng nhập với mật khẩu mới.</p>
              <Link
                to="/login"
                className="block w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-colors shadow text-center"
              >
                Đăng nhập ngay
              </Link>
            </div>
          )}

          {/* Footer link */}
          {step !== 'success' && (
            <p className="text-center text-sm text-gray-500 mt-6">
              Nhớ mật khẩu rồi?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:underline">Đăng nhập</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
