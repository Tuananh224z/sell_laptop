import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../config/Axios';

const VerifyCode = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { setError('Vui lòng nhập đủ 6 chữ số'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/auth/verify-email', { otp: code });
      setSuccess(true);
      setTimeout(() => navigate('/'), 2500);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Mã OTP không đúng');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      await api.post('/auth/resend-otp');
      setCanResend(false);
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setResendMsg('Đã gửi lại mã OTP vào email của bạn!');
      setTimeout(() => setResendMsg(''), 4000);
    } catch { /**/ }
  };

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 max-w-sm w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Xác thực thành công!</h2>
        <p className="text-gray-500 text-sm">Email của bạn đã được xác thực. Đang chuyển hướng...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <div className="bg-primary-50 text-primary-600 p-4 rounded-full shadow-sm">
            <ShieldCheck className="w-12 h-12" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Xác thực Email</h2>
        <p className="mt-2 text-center text-sm text-gray-600 max-w-sm mx-auto">
          Chúng tôi đã gửi mã OTP 6 chữ số đến <strong>{user?.email ?? 'email của bạn'}</strong>. Vui lòng nhập mã để hoàn tất.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-gray-100">

          {/* Resend success */}
          {resendMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 rounded-xl mb-5 text-center">
              ✅ {resendMsg}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl mb-5 text-center">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* OTP Inputs */}
            <div className="flex justify-between gap-2" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  className={`w-12 h-14 text-center text-2xl font-bold border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 focus:bg-white transition-all ${digit ? 'border-primary-400 bg-primary-50' : 'border-gray-300'}`}
                />
              ))}
            </div>

            <button
              type="submit" disabled={loading || otp.join('').length !== 6}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:text-gray-400 transition-colors"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Đang xác nhận...
                </span>
              ) : 'Xác Nhận Ngay'}
            </button>

            <div className="text-center text-sm text-gray-600">
              Chưa nhận được mã?{' '}
              <button type="button" onClick={handleResend} disabled={!canResend}
                className={`font-semibold transition-colors ${canResend ? 'text-primary-600 hover:text-primary-500 cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}>
                {canResend ? 'Gửi lại' : `Gửi lại (${countdown}s)`}
              </button>
            </div>

            <Link to="/register" className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Quay lại đăng ký
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;
