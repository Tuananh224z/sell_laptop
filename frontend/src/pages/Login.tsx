import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, XCircle } from 'lucide-react';

/* ─── Toast nổi ─── */
const ErrorToast = ({ msg, onClose }: { msg: string; onClose: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 bg-white border border-red-200 text-red-700 shadow-xl px-5 py-3.5 rounded-2xl min-w-[280px] max-w-sm animate-[fadeDown_0.25s_ease]">
      <XCircle className="w-5 h-5 shrink-0 text-red-500" />
      <span className="text-sm font-medium flex-1">{msg}</span>
      <button onClick={onClose} className="text-red-400 hover:text-red-600 transition-colors">
        <XCircle className="w-4 h-4" />
      </button>
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const showError = (msg: string) => {
    setToast(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Đăng nhập thất bại. Vui lòng thử lại.';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Keyframe animation */}
      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translate(-50%, -12px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-6px); }
          40%     { transform: translateX(6px); }
          60%     { transform: translateX(-4px); }
          80%     { transform: translateX(4px); }
        }
        .shake { animation: shake 0.45s ease; }
      `}</style>

      {toast && <ErrorToast msg={toast} onClose={() => setToast('')} />}

      <div className="bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-600 text-white p-3 rounded-lg font-bold text-2xl leading-none shadow-md">TS</div>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Đăng nhập tài khoản</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hoặc{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
              đăng ký tài khoản mới ngay
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className={`bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border transition-all ${shake ? 'border-red-300 shake' : 'border-gray-100'}`}>
            <form className="space-y-6" onSubmit={handleLogin}>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Địa chỉ Email</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email" name="email" type="email" autoComplete="email" required
                    value={email} onChange={e => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-gray-50 focus:bg-white transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password" name="password" type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password" required
                    value={password} onChange={e => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-gray-50 focus:bg-white transition-colors"
                    placeholder="••••••••"
                  />
                  <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword
                      ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      : <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input id="remember-me" name="remember-me" type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer" />
                  <span className="text-sm text-gray-700">Ghi nhớ đăng nhập</span>
                </label>
                <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors">
                  Quên mật khẩu?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    Đăng Nhập
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
