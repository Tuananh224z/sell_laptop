import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, ShoppingCart, Phone, MapPin } from 'lucide-react';

const steps = [
  { step: '01', title: 'Chọn sản phẩm', desc: 'Duyệt qua các danh mục hoặc dùng thanh tìm kiếm. Nhấn vào sản phẩm để xem chi tiết thông số, hình ảnh và đánh giá.' },
  { step: '02', title: 'Thêm vào giỏ hàng', desc: 'Chọn cấu hình (màu sắc, dung lượng...), nhấn "Thêm vào giỏ hàng" hoặc "Mua ngay" để đặt hàng nhanh.' },
  { step: '03', title: 'Điền thông tin giao hàng', desc: 'Nhập họ tên, số điện thoại và địa chỉ nhận hàng chính xác. Bạn có thể lưu nhiều địa chỉ nếu đã có tài khoản.' },
  { step: '04', title: 'Chọn phương thức thanh toán', desc: 'Hỗ trợ: COD, chuyển khoản ngân hàng, thẻ tín dụng/ghi nợ, ví điện tử MoMo / ZaloPay / VNPay.' },
  { step: '05', title: 'Xác nhận đơn hàng', desc: 'Kiểm tra lại thông tin và nhấn "Đặt hàng". Bạn nhận SMS/Email xác nhận và theo dõi trạng thái trong mục "Đơn hàng của tôi".' },
];

const faqs = [
  { q: 'Tôi có thể đặt hàng mà không cần tài khoản không?', a: 'Có, bạn có thể đặt hàng với tư cách khách. Đăng ký tài khoản giúp bạn theo dõi đơn hàng, tích điểm và nhận ưu đãi.' },
  { q: 'Làm sao biết đơn hàng đã đặt thành công?', a: 'Hệ thống sẽ gửi email và SMS xác nhận đến thông tin bạn đã cung cấp.' },
  { q: 'Tôi có thể huỷ đơn hàng không?', a: 'Có thể huỷ trong vòng 1 giờ sau khi đặt khi đơn chưa xử lý. Liên hệ hotline 0123 456 789 để được hỗ trợ.' },
];

const BuyingGuide = () => (
  <div className="bg-gray-50 min-h-screen pb-16">
    <div className="max-w-[1200px] mx-auto px-4 pt-8">
      <nav className="text-sm text-gray-500 flex items-center gap-1 mb-6">
        <Link to="/" className="hover:text-primary-600">Trang chủ</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-800 font-medium">Hướng dẫn mua hàng</span>
      </nav>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Hướng dẫn mua hàng</h1>
            <p className="text-sm text-gray-500 mt-0.5">Quy trình đặt hàng tại TechStore đơn giản, nhanh chóng</p>
          </div>
        </div>
        <div className="space-y-6">
          {steps.map((s, i) => (
            <div key={s.step} className="flex gap-4">
              <div className="shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-extrabold text-sm">{s.step}</div>
              <div className={`flex-1 pb-6 ${i < steps.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <h2 className="font-bold text-gray-900 mb-1">{s.title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Các kênh mua hàng</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: ShoppingCart, title: 'Mua online', desc: 'Đặt hàng trên website 24/7, giao hàng toàn quốc' },
            { icon: Phone, title: 'Đặt qua hotline', desc: 'Gọi 0123 456 789 — hỗ trợ 8:00–22:00' },
            { icon: MapPin, title: 'Tại cửa hàng', desc: '123 Đường Công Nghệ, Q.1, TP. HCM — mở 8:00–21:00' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center bg-gray-50 rounded-xl p-5 border border-gray-100">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">{title}</h3>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Câu hỏi thường gặp</h2>
        <div className="space-y-3">
          {faqs.map(f => (
            <details key={f.q} className="group border border-gray-100 rounded-xl overflow-hidden">
              <summary className="px-5 py-4 cursor-pointer font-medium text-gray-900 text-sm flex justify-between items-center select-none hover:bg-gray-50 list-none">
                {f.q} <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform shrink-0 ml-2" />
              </summary>
              <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default BuyingGuide;
