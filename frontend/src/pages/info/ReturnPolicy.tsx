import { Link } from 'react-router-dom';
import { ArrowLeftRight, ChevronRight, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const conditions = [
  'Sản phẩm còn trong thời hạn đổi trả (30 ngày với lỗi nhà sản xuất, 7 ngày đổi hàng)',
  'Còn nguyên hộp, phụ kiện, tem niêm phong và hóa đơn mua hàng',
  'Sản phẩm chưa bị can thiệp sửa chữa bên ngoài',
  'Lỗi do nhà sản xuất (không do người dùng)',
];

const notAccepted = [
  'Hư hỏng do va đập, rơi vỡ, chất lỏng (trừ gói bảo hành toàn diện)',
  'Sản phẩm hết hạn đổi trả theo quy định',
  'Sản phẩm đã qua sử dụng rõ ràng, trầy xước nặng',
  'Mất hóa đơn hoặc không đủ phụ kiện đi kèm',
  'Sản phẩm mua theo dạng khuyến mãi đặc biệt có ghi "không đổi trả"',
];

const process = [
  { title: 'Liên hệ TechStore', desc: 'Hotline 0123 456 789 hoặc email support@techstore.vn để đăng ký đổi/trả.' },
  { title: 'Kiểm tra điều kiện', desc: 'Nhân viên kiểm tra sản phẩm theo tiêu chuẩn đổi trả trong vòng 24h.' },
  { title: 'Xác nhận và xử lý', desc: 'Đổi sản phẩm mới hoặc hoàn tiền theo phương thức thanh toán ban đầu.' },
  { title: 'Hoàn tất', desc: 'Nhận sản phẩm mới hoặc tiền hoàn trong 3–5 ngày làm việc.' },
];

const ReturnPolicy = () => (
  <div className="bg-gray-50 min-h-screen pb-16">
    <div className="max-w-[1200px] mx-auto px-4 pt-8">
      <nav className="text-sm text-gray-500 flex items-center gap-1 mb-6">
        <Link to="/" className="hover:text-primary-600">Trang chủ</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-800 font-medium">Chính sách đổi trả</span>
      </nav>

      {/* Hero */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
            <ArrowLeftRight className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Chính sách đổi trả</h1>
            <p className="text-sm text-gray-500 mt-0.5">Cam kết đổi trả minh bạch — bảo vệ quyền lợi người mua</p>
          </div>
        </div>

        {/* Time highlight */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
            <p className="text-3xl font-extrabold text-green-600 mb-1">30 ngày</p>
            <p className="text-sm font-semibold text-gray-800">Đổi máy lỗi nhà sản xuất</p>
            <p className="text-xs text-gray-500 mt-1">Đổi 1-1 hoặc đổi sản phẩm tương đương</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
            <p className="text-3xl font-extrabold text-blue-600 mb-1">7 ngày</p>
            <p className="text-sm font-semibold text-gray-800">Đổi hàng không vừa ý</p>
            <p className="text-xs text-gray-500 mt-1">Không cần lý do, hoàn tiền hoặc đổi sản phẩm</p>
          </div>
        </div>

        {/* Conditions */}
        <h2 className="text-base font-bold text-gray-900 mb-3">Điều kiện đổi trả</h2>
        <ul className="space-y-2 mb-6">
          {conditions.map(c => (
            <li key={c} className="flex items-start gap-2 text-sm text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />{c}
            </li>
          ))}
        </ul>

        {/* Not accepted */}
        <div className="bg-red-50 border border-red-100 rounded-xl p-5 mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" /> Trường hợp không áp dụng
          </h2>
          <ul className="space-y-2">
            {notAccepted.map(c => (
              <li key={c} className="flex items-start gap-2 text-sm text-gray-600">
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />{c}
              </li>
            ))}
          </ul>
        </div>

        {/* Process */}
        <h2 className="text-base font-bold text-gray-900 mb-4">Quy trình đổi trả</h2>
        <div className="space-y-4">
          {process.map((p, i) => (
            <div key={p.title} className="flex gap-4">
              <div className="shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xs">{i + 1}</div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{p.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-orange-500 rounded-2xl p-6 text-white text-center">
        <p className="font-bold text-lg mb-1">Yêu cầu đổi trả ngay hôm nay</p>
        <p className="text-orange-100 text-sm mb-4">Hỗ trợ đổi trả nhanh — Thứ 2 đến Chủ nhật, 8:00 – 22:00</p>
        <a href="tel:0123456789" className="inline-block bg-white text-orange-600 font-bold px-6 py-2.5 rounded-xl hover:bg-orange-50 transition-colors">
          Gọi 0123 456 789
        </a>
      </div>
    </div>
  </div>
);

export default ReturnPolicy;
