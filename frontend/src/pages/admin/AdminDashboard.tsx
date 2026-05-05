import { ShoppingBag, Users, Package, Star, TrendingUp, ArrowUpRight, MoreHorizontal, DollarSign } from 'lucide-react';

const stats = [
  { label: 'Doanh thu tháng', value: '₫248.5M', change: '+12.5%', up: true, icon: DollarSign, color: 'bg-blue-500' },
  { label: 'Đơn hàng mới', value: '1,284', change: '+8.2%', up: true, icon: ShoppingBag, color: 'bg-violet-500' },
  { label: 'Sản phẩm', value: '348', change: '+5 mới', up: true, icon: Package, color: 'bg-green-500' },
  { label: 'Người dùng', value: '5,720', change: '+243 tháng này', up: true, icon: Users, color: 'bg-orange-500' },
];

const recentOrders = [
  { id: '#ORD-001', customer: 'Nguyễn Văn A', product: 'Laptop ASUS ROG G15', total: '59,990,000₫', status: 'Đang giao', statusColor: 'bg-blue-100 text-blue-700' },
  { id: '#ORD-002', customer: 'Trần Thị B', product: 'Chuột Logitech G Pro X2', total: '2,790,000₫', status: 'Hoàn thành', statusColor: 'bg-green-100 text-green-700' },
  { id: '#ORD-003', customer: 'Lê Văn C', product: 'SSD Samsung 990 Pro 2TB', total: '3,190,000₫', status: 'Chờ xử lý', statusColor: 'bg-yellow-100 text-yellow-700' },
  { id: '#ORD-004', customer: 'Phạm Thị D', product: 'MacBook Pro M3 16"', total: '69,990,000₫', status: 'Hoàn thành', statusColor: 'bg-green-100 text-green-700' },
  { id: '#ORD-005', customer: 'Hoàng Văn E', product: 'Màn hình LG 27" 4K', total: '18,990,000₫', status: 'Đã huỷ', statusColor: 'bg-red-100 text-red-700' },
];

const topProducts = [
  { name: 'SSD Samsung 990 Pro 2TB', sold: 670, revenue: '₫2.1B' },
  { name: 'Chuột Logitech G Pro X2', sold: 380, revenue: '₫1.06B' },
  { name: 'Bàn phím Keychron Q1 Pro', sold: 312, revenue: '₫1.09B' },
  { name: 'MacBook Pro M3 16 inch', sold: 210, revenue: '₫14.7B' },
  { name: 'Laptop ASUS ROG G15', sold: 125, revenue: '₫7.5B' },
];

const AdminDashboard = () => (
  <div className="p-6 space-y-6">
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">Tổng quan</h1>
      <p className="text-sm text-gray-500 mt-0.5">Chào mừng trở lại! Đây là tóm tắt hoạt động hôm nay.</p>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map(s => (
        <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
          <div className={`w-11 h-11 ${s.color} rounded-xl flex items-center justify-center shrink-0`}>
            <s.icon className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 mb-0.5">{s.label}</p>
            <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
            <p className={`text-xs font-semibold mt-0.5 flex items-center gap-0.5 ${s.up ? 'text-green-600' : 'text-red-500'}`}>
              <ArrowUpRight className="w-3 h-3" /> {s.change}
            </p>
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Recent Orders */}
      <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Đơn hàng gần đây</h2>
          <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><MoreHorizontal className="w-5 h-5" /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Mã đơn</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Khách hàng</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Sản phẩm</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tổng tiền</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map(o => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 font-mono text-xs text-gray-500">{o.id}</td>
                  <td className="px-6 py-3 font-medium text-gray-900">{o.customer}</td>
                  <td className="px-6 py-3 text-gray-600 hidden md:table-cell max-w-[180px] truncate">{o.product}</td>
                  <td className="px-6 py-3 font-semibold text-gray-900">{o.total}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${o.statusColor}`}>{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Top sản phẩm</h2>
          <TrendingUp className="w-4 h-4 text-green-500" />
        </div>
        <div className="p-4 space-y-3">
          {topProducts.map((p, i) => (
            <div key={p.name} className="flex items-center gap-3">
              <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                <p className="text-xs text-gray-500">Đã bán: {p.sold}</p>
              </div>
              <span className="text-xs font-bold text-green-600 shrink-0">{p.revenue}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
