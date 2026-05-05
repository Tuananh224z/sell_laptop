import { useState, useEffect } from 'react';
import { Package, Search, ChevronRight, Clock, CheckCircle2, Truck, XCircle, AlertCircle } from 'lucide-react';
import api from '../../lib/api';
import { Link } from 'react-router-dom';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const getImgUrl = (src: string) => {
  const fallback = 'https://placehold.co/80x80/f3f4f6/9ca3af?text=No+Image';
  if (!src) return fallback;
  if (/^https?:\/\//.test(src)) return src;
  const path = src.startsWith('/') ? src : `/${src}`;
  return `${BACKEND}${path}`;
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'pending':    return { label: 'Đang xử lý', color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Clock };
    case 'processing': return { label: 'Đã xác nhận', color: 'text-blue-600 bg-blue-50 border-blue-100', icon: Package };
    case 'shipping':   return { label: 'Đang giao hàng', color: 'text-indigo-600 bg-indigo-50 border-indigo-100', icon: Truck };
    case 'delivered':  return { label: 'Đã giao', color: 'text-green-600 bg-green-50 border-green-100', icon: CheckCircle2 };
    case 'cancelled':  return { label: 'Đã hủy', color: 'text-red-600 bg-red-50 border-red-100', icon: XCircle };
    default:           return { label: 'Không xác định', color: 'text-gray-600 bg-gray-50 border-gray-100', icon: AlertCircle };
  }
};

const ProfileOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/orders')
      .then(res => setOrders(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter(o => 
    o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.items.some((i: any) => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Đơn hàng của tôi</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý và theo dõi trạng thái đơn hàng</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm theo Mã đơn / Tên SP"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 outline-none w-full md:w-64"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-gray-50 animate-pulse rounded-xl" />
          ))}
        </div>
      )}

      {/* Order List */}
      {!loading && (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const status = getStatusInfo(order.orderStatus);
            const Icon = status.icon;
            return (
              <div key={order._id} className="border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors">
                {/* Order Header */}
                <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-bold text-gray-900">#{order.orderNumber}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${status.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {status.label}
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 space-y-4">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4">
                      <img 
                        src={getImgUrl(item.thumbnail)} 
                        alt={item.name} 
                        className="w-16 h-16 object-contain rounded-lg border border-gray-100 bg-gray-50 shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-gray-400 mt-1">x{item.quantity}</p>
                        {item.variantLabel && (
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded mt-1 inline-block">
                            {item.variantLabel}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{item.price.toLocaleString('vi-VN')}₫</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="bg-gray-50/30 px-4 py-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4">
                  <div className="text-sm">
                    <span className="text-gray-500">Thành tiền:</span>
                    <span className="ml-2 font-bold text-primary-600 text-base">{order.total.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-medium hover:bg-white transition-colors">
                      Liên hệ
                    </button>
                    <button className="px-4 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors">
                      Mua lại
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Không tìm thấy đơn hàng nào</p>
              <Link to="/products" className="mt-4 inline-block text-sm text-primary-600 font-bold hover:underline">
                Tiếp tục mua sắm
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileOrders;
