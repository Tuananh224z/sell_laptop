import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, Phone, AlertCircle, X, CheckCircle2, FileText, ShieldCheck } from 'lucide-react';

/* ─── Policy Modal ─── */
type PolicyType = 'terms' | 'privacy';

const POLICY_CONTENT: Record<PolicyType, { title: string; icon: React.ReactNode; sections: { heading: string; body: string }[] }> = {
  terms: {
    title: 'Điều khoản dịch vụ',
    icon: <FileText className="w-6 h-6 text-primary-600" />,
    sections: [
      {
        heading: '1. Chấp nhận điều khoản',
        body: 'Bằng cách đăng ký và sử dụng dịch vụ của TechStore, bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện này. Nếu bạn không đồng ý với bất kỳ phần nào, bạn không được phép sử dụng dịch vụ.',
      },
      {
        heading: '2. Tài khoản người dùng',
        body: 'Bạn chịu trách nhiệm duy trì bảo mật tài khoản và mật khẩu của mình. TechStore không chịu trách nhiệm về bất kỳ tổn thất hay thiệt hại nào phát sinh từ việc bạn không bảo mật thông tin tài khoản.',
      },
      {
        heading: '3. Sử dụng dịch vụ',
        body: 'Bạn đồng ý không sử dụng dịch vụ cho bất kỳ mục đích bất hợp pháp hoặc trái với các điều khoản này. Việc sử dụng dịch vụ để gian lận, lừa đảo hoặc phá hoại hệ thống sẽ dẫn đến khóa tài khoản vĩnh viễn.',
      },
      {
        heading: '4. Mua hàng và thanh toán',
        body: 'Tất cả giao dịch mua hàng đều phải được thanh toán đầy đủ trước khi giao hàng. Giá sản phẩm có thể thay đổi mà không cần báo trước. TechStore cam kết cung cấp thông tin giá chính xác tại thời điểm đặt hàng.',
      },
      {
        heading: '5. Đổi trả và hoàn tiền',
        body: 'Sản phẩm có thể được đổi trả trong vòng 7 ngày kể từ ngày nhận hàng nếu còn nguyên trạng, chưa qua sử dụng và có đủ hóa đơn, phụ kiện đi kèm. Sản phẩm lỗi do nhà sản xuất được bảo hành theo chính sách của hãng.',
      },
      {
        heading: '6. Quyền sở hữu trí tuệ',
        body: 'Tất cả nội dung trên website TechStore bao gồm văn bản, hình ảnh, logo, biểu tượng đều thuộc quyền sở hữu của TechStore. Nghiêm cấm sao chép, phân phối mà không có sự cho phép bằng văn bản.',
      },
    ],
  },
  privacy: {
    title: 'Chính sách bảo mật',
    icon: <ShieldCheck className="w-6 h-6 text-primary-600" />,
    sections: [
      {
        heading: '1. Thông tin chúng tôi thu thập',
        body: 'TechStore thu thập các thông tin bạn cung cấp khi đăng ký tài khoản (họ tên, email, số điện thoại), thông tin đặt hàng và địa chỉ giao hàng, cùng dữ liệu sử dụng website như lịch sử xem sản phẩm và tìm kiếm.',
      },
      {
        heading: '2. Cách chúng tôi sử dụng thông tin',
        body: 'Thông tin của bạn được sử dụng để xử lý đơn hàng và thanh toán, gửi thông báo về đơn hàng và khuyến mãi (nếu bạn đồng ý), cải thiện trải nghiệm mua sắm và bảo vệ an toàn tài khoản.',
      },
      {
        heading: '3. Bảo mật thông tin',
        body: 'Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn ngành bao gồm mã hóa SSL, xác thực hai yếu tố và kiểm tra bảo mật định kỳ. Mật khẩu của bạn được mã hóa và chúng tôi không thể đọc được.',
      },
      {
        heading: '4. Chia sẻ thông tin',
        body: 'TechStore không bán, cho thuê hay chia sẻ thông tin cá nhân của bạn cho bên thứ ba vì mục đích thương mại. Thông tin chỉ được chia sẻ với đối tác vận chuyển khi cần thiết để thực hiện đơn hàng của bạn.',
      },
      {
        heading: '5. Cookie và công nghệ theo dõi',
        body: 'Website sử dụng cookie để cải thiện trải nghiệm người dùng và phân tích lưu lượng truy cập. Bạn có thể tắt cookie trong cài đặt trình duyệt, tuy nhiên điều này có thể ảnh hưởng đến một số tính năng của website.',
      },
      {
        heading: '6. Quyền của bạn',
        body: 'Bạn có quyền truy cập, chỉnh sửa hoặc xóa thông tin cá nhân của mình bất kỳ lúc nào thông qua trang hồ sơ. Để yêu cầu xóa tài khoản hoàn toàn, vui lòng liên hệ bộ phận hỗ trợ của chúng tôi.',
      },
    ],
  },
};

const PolicyModal = ({
  type,
  onClose,
  onAgree,
}: {
  type: PolicyType;
  onClose: () => void;
  onAgree: () => void;
}) => {
  const content = POLICY_CONTENT[type];
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) setScrolled(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
            {content.icon}
          </div>
          <div className="flex-1">
            <h2 className="font-extrabold text-gray-900 text-base">{content.title}</h2>
            <p className="text-xs text-gray-400 mt-0.5">TechStore — Cập nhật 01/2026</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content scroll */}
        <div
          className="flex-1 overflow-y-auto px-6 py-4 space-y-5"
          onScroll={handleScroll}
        >
          {content.sections.map((s) => (
            <div key={s.heading}>
              <h3 className="font-bold text-gray-900 text-sm mb-1.5">{s.heading}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
          <div className="h-1" /> {/* bottom padding trigger */}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          {!scrolled && (
            <p className="text-xs text-gray-400 text-center mb-3">
              📖 Cuộn xuống để đọc toàn bộ nội dung
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={() => { onAgree(); onClose(); }}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Tôi đồng ý
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Register ─── */
const Register = () => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [openPolicy, setOpenPolicy] = useState<PolicyType | null>(null);
  const navigate = useNavigate();
  const { register } = useAuth();

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!termsChecked) { setError('Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật'); return; }
    if (form.password !== form.confirm) { setError('Mật khẩu nhập lại không khớp'); return; }
    if (form.password.length < 6) { setError('Mật khẩu phải ít nhất 6 ký tự'); return; }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      navigate('/verify');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <div className="bg-primary-600 text-white p-3 rounded-lg font-bold text-2xl leading-none shadow-md">TS</div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Đăng ký thành viên</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">Đăng nhập ngay</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-gray-100">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
              <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Họ và Tên</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-gray-400" /></div>
                <input id="name" name="name" type="text" required value={form.name} onChange={e => set('name', e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 sm:text-sm bg-gray-50 focus:bg-white"
                  placeholder="Nguyễn Văn A" />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="h-5 w-5 text-gray-400" /></div>
                <input id="phone" name="phone" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 sm:text-sm bg-gray-50 focus:bg-white"
                  placeholder="0912 345 678" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Địa chỉ Email</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
                <input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={e => set('email', e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 sm:text-sm bg-gray-50 focus:bg-white"
                  placeholder="you@example.com" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} required value={form.password} onChange={e => set('password', e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 sm:text-sm bg-gray-50 focus:bg-white"
                  placeholder="••••••••" />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Nhập lại mật khẩu</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
                <input id="confirm-password" name="confirm-password" type={showConfirm ? 'text' : 'password'} required value={form.confirm} onChange={e => set('confirm', e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 sm:text-sm bg-gray-50 focus:bg-white"
                  placeholder="••••••••" />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${termsChecked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <button
                type="button"
                onClick={() => setTermsChecked(v => !v)}
                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${termsChecked ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300 hover:border-primary-400'}`}
              >
                {termsChecked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </button>
              <span className="text-sm text-gray-700 leading-relaxed">
                Tôi đã đọc và đồng ý với{' '}
                <button
                  type="button"
                  onClick={() => setOpenPolicy('terms')}
                  className="font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                >
                  Điều khoản dịch vụ
                </button>
                {' '}và{' '}
                <button
                  type="button"
                  onClick={() => setOpenPolicy('privacy')}
                  className="font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                >
                  Chính sách bảo mật
                </button>
                {termsChecked && <span className="ml-1 text-green-600 font-medium">✓</span>}
              </span>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 focus:outline-none transition-colors">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang tạo tài khoản...
                </span>
              ) : 'Tạo Tài Khoản'}
            </button>
          </form>
        </div>
      </div>

      {/* Policy modals */}
      {openPolicy && (
        <PolicyModal
          type={openPolicy}
          onClose={() => setOpenPolicy(null)}
          onAgree={() => setTermsChecked(true)}
        />
      )}
    </div>
  );
};

export default Register;
