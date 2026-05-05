import { Link } from 'react-router-dom';
import { Shield, ChevronRight, CheckCircle2, XCircle, Clock } from 'lucide-react';

const tiers = [
  { tier: 'Bảo hành tiêu chuẩn', duration: '12 tháng', items: ['Laptop, PC Gaming, Màn hình', 'Lỗi phần cứng do nhà sản xuất', 'Kiểm tra và sửa chữa miễn phí', 'Đổi máy nếu lỗi 3 lần cùng lỗi'], color: 'border-blue-200 bg-blue-50' },
  { tier: 'Bảo hành mở rộng', duration: '24 tháng', items: ['Tất cả quyền lợi gói 12 tháng', 'Ưu tiên sửa chữa nhanh (< 48h)', 'Hỗ trợ kỹ thuật từ xa ưu tiên', 'Giảm 20% phụ kiện chính hãng'], color: 'border-primary-200 bg-primary-50' },
  { tier: 'Bảo hành toàn diện', duration: '24 tháng', items: ['Tất cả quyền lợi gói mở rộng', 'Bao gồm tai nạn, rơi vỡ, vào nước', 'Thay thế phụ tùng miễn phí', 'Máy dùng tạm trong thời gian sửa'], color: 'border-violet-200 bg-violet-50' },
];

const notCovered = ['Hư hỏng do tự ý sửa chữa', 'Thiên tai, hoả hoạn, ngập lụt (gói tiêu chuẩn)', 'Hao mòn tự nhiên (pin, bàn phím...)', 'Mất, thất lạc sản phẩm', 'Hư hỏng do phần mềm / virus'];

const WarrantyPolicy = () => (
  <div className="bg-gray-50 min-h-screen pb-16">
    <div className="max-w-[1200px] mx-auto px-4 pt-8">
      <nav className="text-sm text-gray-500 flex items-center gap-1 mb-6">
        <Link to="/" className="hover:text-primary-600">Trang chủ</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-800 font-medium">Chính sách bảo hành</span>
      </nav>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Chính sách bảo hành</h1>
            <p className="text-sm text-gray-500 mt-0.5">Cam kết bảo vệ quyền lợi khách hàng tại TechStore</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {tiers.map(t => (
            <div key={t.tier} className={`rounded-xl border-2 p-5 ${t.color}`}>
              <h3 className="font-bold text-gray-900 mb-1">{t.tier}</h3>
              <div className="flex items-center gap-1.5 mb-3">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs font-semibold text-gray-600">{t.duration}</span>
              </div>
              <ul className="space-y-2">
                {t.items.map(item => (
                  <li key={item} className="flex items-start gap-2 text-xs text-gray-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <h2 className="text-base font-bold text-gray-900 mb-3">Quy trình bảo hành</h2>
        <div className="flex flex-col sm:flex-row gap-0 mb-8">
          {['Liên hệ TechStore', 'Kiểm tra máy', 'Báo giá & xác nhận', 'Sửa chữa / Đổi máy', 'Bàn giao'].map((step, i, arr) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</div>
                <span className="text-xs text-gray-600 mt-1.5 text-center">{step}</span>
              </div>
              {i < arr.length - 1 && <div className="hidden sm:block h-0.5 w-4 bg-gray-200 shrink-0 -mt-4" />}
            </div>
          ))}
        </div>

        <h2 className="text-base font-bold text-gray-900 mb-3">Trường hợp không được bảo hành</h2>
        <ul className="space-y-2">
          {notCovered.map(item => (
            <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
              <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-primary-600 rounded-2xl p-6 text-white text-center">
        <p className="font-bold text-lg mb-1">Cần hỗ trợ bảo hành?</p>
        <p className="text-primary-100 text-sm mb-4">Hotline hỗ trợ kỹ thuật — Thứ 2 đến Chủ nhật, 8:00 – 22:00</p>
        <a href="tel:0123456789" className="inline-block bg-white text-primary-600 font-bold px-6 py-2.5 rounded-xl hover:bg-primary-50 transition-colors">
          Gọi 0123 456 789
        </a>
      </div>
    </div>
  </div>
);

export default WarrantyPolicy;
