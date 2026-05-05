import { Link } from 'react-router-dom';
import { CreditCard, ChevronRight, Banknote, Smartphone, Building2, ShieldCheck } from 'lucide-react';

const methods = [
  {
    icon: Banknote,
    title: 'Thanh toán khi nhận hàng (COD)',
    color: 'bg-green-100 text-green-600',
    desc: 'Thanh toán bằng tiền mặt khi nhận hàng. Áp dụng toàn quốc cho đơn hàng đến 20 triệu đồng. Không phát sinh phí.',
    steps: ['Đặt hàng → nhận hàng → trả tiền', 'Kiểm tra hàng trước khi thanh toán', 'Áp dụng cho đơn ≤ 20 triệu đồng']
  },
  {
    icon: Building2,
    title: 'Chuyển khoản ngân hàng',
    color: 'bg-blue-100 text-blue-600',
    desc: 'Chuyển khoản qua Internet Banking hoặc ATM. Đơn hàng xử lý sau khi xác nhận thanh toán.',
    steps: ['MB Bank: 1234 5678 9012 3456 — TechStore JSC', 'Vietcombank: 9876 5432 1098 7654 — TechStore JSC', 'Nội dung: [Số điện thoại] + [Mã đơn hàng]']
  },
  {
    icon: CreditCard,
    title: 'Thẻ tín dụng / Ghi nợ',
    color: 'bg-violet-100 text-violet-600',
    desc: 'Thanh toán bằng thẻ Visa, Mastercard, JCB, AMEX. Hỗ trợ trả góp 0% qua thẻ tín dụng từ 6–24 tháng.',
    steps: ['Visa / Mastercard / JCB / AMEX', 'Trả góp 0% từ 3 – 24 tháng (thẻ tín dụng)', 'Bảo mật thanh toán chuẩn PCI-DSS']
  },
  {
    icon: Smartphone,
    title: 'Ví điện tử',
    color: 'bg-pink-100 text-pink-600',
    desc: 'Thanh toán nhanh qua MoMo, ZaloPay, VNPay. Quét QR hoặc nhập số điện thoại tại bước thanh toán.',
    steps: ['MoMo — SĐT 0123 456 789', 'ZaloPay — liên kết tài khoản', 'VNPay QR — quét mã thanh toán tức thì']
  },
];

const PaymentMethods = () => (
  <div className="bg-gray-50 min-h-screen pb-16">
    <div className="max-w-[1200px] mx-auto px-4 pt-8">
      <nav className="text-sm text-gray-500 flex items-center gap-1 mb-6">
        <Link to="/" className="hover:text-primary-600">Trang chủ</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-800 font-medium">Phương thức thanh toán</span>
      </nav>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Phương thức thanh toán</h1>
            <p className="text-sm text-gray-500 mt-0.5">Đa dạng hình thức thanh toán — an toàn và tiện lợi</p>
          </div>
        </div>

        <div className="space-y-5">
          {methods.map(m => (
            <div key={m.title} className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.color}`}>
                  <m.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h2 className="font-bold text-gray-900 mb-1">{m.title}</h2>
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">{m.desc}</p>
                  <ul className="space-y-1">
                    {m.steps.map(s => (
                      <li key={s} className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full shrink-0" />{s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-start gap-4">
        <ShieldCheck className="w-8 h-8 text-green-500 shrink-0 mt-0.5" />
        <div>
          <h2 className="font-bold text-gray-900 mb-1">Bảo mật thanh toán</h2>
          <p className="text-sm text-gray-600">Mọi giao dịch đều được mã hóa SSL 256-bit và tuân thủ tiêu chuẩn bảo mật PCI-DSS. TechStore không lưu trữ thông tin thẻ của khách hàng.</p>
        </div>
      </div>
    </div>
  </div>
);

export default PaymentMethods;
