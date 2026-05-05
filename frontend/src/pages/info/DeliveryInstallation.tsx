import { Link } from 'react-router-dom';
import { Truck, ChevronRight, Clock, Wrench, CheckCircle2, AlertTriangle } from 'lucide-react';

const deliveryZones = [
  { zone: 'Nội thành TP. HCM & Hà Nội', time: '2 – 4 giờ', fee: 'Miễn phí (đơn ≥ 2 triệu)', note: 'Giao hàng nhanh trong ngày' },
  { zone: 'Tỉnh thành khác (nội tỉnh)', time: '1 – 2 ngày', fee: 'Miễn phí (đơn ≥ 2 triệu)', note: 'Giao qua đối tác GHTK, GHN' },
  { zone: 'Vùng sâu, hải đảo', time: '3 – 7 ngày', fee: 'Theo cước vận chuyển thực tế', note: 'Liên hệ để biết chính xác' },
];

const installServices = [
  { title: 'Lắp đặt PC & Workstation', desc: 'Kỹ thuật viên đến tận nơi lắp ráp và cài đặt phần mềm cho bộ PC, workstation. Thời gian: 1 – 3 giờ.' },
  { title: 'Lắp đặt màn hình', desc: 'Lắp màn hình lên giá đỡ, kết nối cáp, cân chỉnh và kiểm tra hình ảnh. Hỗ trợ nhiều màn hình.' },
  { title: 'Setup góc gaming', desc: 'Tư vấn và setup toàn diện bàn gaming: PC, màn hình, bàn phím, chuột, tai nghe, đèn LED. Cài game, driver.' },
  { title: 'Cài đặt phần mềm', desc: 'Cài Windows, driver, phần mềm văn phòng, bảo mật. Chuyển dữ liệu từ máy cũ sang máy mới.' },
];

const DeliveryInstallation = () => (
  <div className="bg-gray-50 min-h-screen pb-16">
    <div className="max-w-[1200px] mx-auto px-4 pt-8">
      <nav className="text-sm text-gray-500 flex items-center gap-1 mb-6">
        <Link to="/" className="hover:text-primary-600">Trang chủ</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-800 font-medium">Giao hàng và lắp đặt</span>
      </nav>

      {/* Delivery */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Giao hàng và lắp đặt</h1>
            <p className="text-sm text-gray-500 mt-0.5">Giao nhanh toàn quốc — Lắp đặt tận nơi chuyên nghiệp</p>
          </div>
        </div>

        <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Truck className="w-4 h-4 text-blue-600" /> Khu vực và thời gian giao hàng
        </h2>
        <div className="overflow-x-auto rounded-xl border border-gray-100 mb-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Khu vực</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Thời gian</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Phí vận chuyển</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden sm:table-cell">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {deliveryZones.map((z, i) => (
                <tr key={z.zone} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-4 py-3 font-medium text-gray-900">{z.zone}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{z.time}</div>
                  </td>
                  <td className="px-4 py-3 text-green-600 font-semibold">{z.fee}</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{z.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3 mb-6">
          <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700">Đơn hàng trên <strong>50 triệu đồng</strong> được giao bởi nhân viên TechStore, có bảo hiểm vận chuyển toàn trình.</p>
        </div>

        <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" /> Cam kết giao hàng
        </h2>
        <ul className="space-y-2">
          {['Đóng gói cẩn thận, chống sốc tiêu chuẩn', 'Kiểm tra hàng trước khi ký nhận', 'Giao đúng hẹn hoặc hoàn phí ship', 'SMS thông báo trạng thái vận chuyển theo thời gian thực'].map(c => (
            <li key={c} className="flex items-start gap-2 text-sm text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />{c}
            </li>
          ))}
        </ul>
      </div>

      {/* Installation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-primary-600" /> Dịch vụ lắp đặt tận nơi
        </h2>
        <p className="text-sm text-gray-500 mb-6">Kỹ thuật viên giàu kinh nghiệm, phục vụ nội thành TP. HCM & Hà Nội</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {installServices.map(s => (
            <div key={s.title} className="border border-gray-100 rounded-xl p-5 hover:border-primary-200 hover:bg-primary-50/30 transition-colors">
              <h3 className="font-bold text-gray-900 mb-2 text-sm">{s.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-600 rounded-2xl p-6 text-white text-center">
        <p className="font-bold text-lg mb-1">Đặt lịch lắp đặt ngay hôm nay</p>
        <p className="text-blue-100 text-sm mb-4">Kỹ thuật viên có mặt trong vòng 24 giờ sau khi nhận hàng</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="tel:0123456789" className="inline-block bg-white text-blue-600 font-bold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors">
            Gọi 0123 456 789
          </a>
          <a href="mailto:support@techstore.vn" className="inline-block border-2 border-white text-white font-bold px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors">
            Email hỗ trợ
          </a>
        </div>
      </div>
    </div>
  </div>
);

export default DeliveryInstallation;
