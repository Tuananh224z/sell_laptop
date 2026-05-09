import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Truck, ShieldCheck, MapPin, AlertCircle, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../config/Axios';
import { toast } from 'react-toastify';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const getImgUrl = (src: string) => {
  const fallback = 'https://placehold.co/80x80/f3f4f6/9ca3af?text=No+Image';
  if (!src) return fallback;
  if (/^https?:\/\//.test(src)) return src;
  const path = src.startsWith('/') ? src : `/${src}`;
  return `${BACKEND}${path}`;
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, loading: cartLoading, refetchCart } = useCart();
  const { items, subtotal } = cart;

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        setSettings(data);
      } catch (err) {
        console.error('Failed to fetch settings');
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await api.get('/addresses');
        setAddresses(res.data);
        const def = res.data.find((a: any) => a.isDefault);
        if (def) setSelectedAddressId(def._id);
        else if (res.data.length > 0) setSelectedAddressId(res.data[0]._id);
      } catch (err) {
        console.error('Failed to fetch addresses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  const getShippingFee = () => {
    if (items.length === 0) return 0;
    if (settings?.freeShipThreshold && subtotal >= settings.freeShipThreshold) return 0;
    return settings?.shippingFee || 50000;
  };

  const tax = settings?.taxRate ? (subtotal * settings.taxRate / 100) : 0;
  const shippingFee = getShippingFee();
  const total = subtotal + shippingFee + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Giỏ hàng của bạn đang trống');
      return;
    }
    if (!selectedAddressId) {
      toast.error('Vui lòng chọn địa chỉ giao hàng');
      return;
    }

    try {
      const { data } = await api.post<{ orderNumber: string }>('/orders', { 
        addressId: selectedAddressId, 
        paymentMethod, 
        note 
      });
      
      toast.success('Đặt hàng thành công!');
      refetchCart(); // This will clear the cart in context
      navigate('/checkout/success', { state: { orderNumber: data.orderNumber } });
    } catch (err: any) {
      console.error('Order failed', err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng!');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 relative">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex text-sm text-gray-500 mb-6">
          <Link to="/cart" className="hover:text-primary-600">Giỏ hàng</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Thanh toán</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Thanh toán đơn hàng</h1>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Form */}
          <div className="lg:w-2/3 space-y-6">
            
            {/* Shipping Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6 text-primary-600 font-bold text-lg">
                <MapPin className="w-5 h-5" />
                <h2>Thông tin giao hàng</h2>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map(i => (
                    <div key={i} className="h-28 bg-gray-50 animate-pulse rounded-lg border border-gray-100" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <div 
                      key={address._id}
                      onClick={() => setSelectedAddressId(address._id)}
                      className={`col-span-1 border rounded-lg p-4 cursor-pointer transition-colors ${selectedAddressId === address._id ? 'border-primary-500 bg-primary-50/50' : 'border-gray-200 hover:border-primary-300'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-gray-900">{address.name}</span>
                        {address.isDefault && (
                          <span className="text-xs font-semibold bg-primary-100 text-primary-700 px-2 py-1 rounded">Mặc định</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{address.phone}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{address.address}, {address.ward}, {address.district}, {address.city}</p>
                    </div>
                  ))}
                  
                  <Link 
                    to="/profile/addresses"
                    className="col-span-1 border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50 hover:text-primary-600 transition-colors h-full min-h-[120px]"
                  >
                    <Plus className="w-5 h-5 mb-1" />
                    <span className="font-medium">Quản lý địa chỉ</span>
                  </Link>
                </div>
              )}

              {addresses.length === 0 && !loading && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3 text-yellow-800 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>Bạn chưa có địa chỉ nào. <Link to="/profile/addresses" className="font-bold underline">Thêm địa chỉ mới</Link> để tiếp tục.</p>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú đơn hàng (Tùy chọn)</label>
                <textarea 
                  rows={3} 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ghi chú về thời gian giao hàng, hướng dẫn tìm địa chỉ..."
                ></textarea>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
               <div className="flex items-center gap-2 mb-6 text-primary-600 font-bold text-lg">
                <CreditCard className="w-5 h-5" />
                <h2>Phương thức thanh toán</h2>
              </div>

              <div className="space-y-3">
                <label className={`block border rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-primary-500 bg-primary-50/30' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="cod" 
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <div className="ml-3 flex items-center gap-3">
                      <Truck className="w-6 h-6 text-gray-600" />
                      <div>
                        <span className="block text-sm font-medium text-gray-900">Thanh toán khi nhận hàng (COD)</span>
                        <span className="block text-xs text-gray-500">Kiểm tra hàng trước khi thanh toán</span>
                      </div>
                    </div>
                  </div>
                </label>

                <label className={`block border rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === 'banking' ? 'border-primary-500 bg-primary-50/30' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="banking" 
                      checked={paymentMethod === 'banking'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <div className="ml-3 flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-gray-600" />
                      <div>
                        <span className="block text-sm font-medium text-gray-900">Chuyển khoản ngân hàng</span>
                        <span className="block text-xs text-gray-500">Thanh toán an toàn qua cổng VNPay/Momo</span>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-4">Đơn hàng của bạn</h2>
              
              {/* Items */}
              <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-1">
                {cartLoading ? (
                  [1, 2].map(i => (
                    <div key={i} className="flex gap-3 items-center animate-pulse">
                      <div className="w-14 h-14 bg-gray-100 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-100 rounded w-3/4" />
                        <div className="h-2 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                ) : items.map((item) => (
                  <div key={item._id} className="flex gap-3 items-center">
                    <img src={getImgUrl(item.thumbnail)} alt={item.name} className="w-14 h-14 object-contain rounded-lg border border-gray-100 shrink-0 bg-gray-50" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.price.toLocaleString('vi-VN')}₫ × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-primary-600 shrink-0">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 mb-6 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-medium text-gray-900">{subtotal.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium text-gray-900">{shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}₫`}</span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Thuế ({settings?.taxRate}%)</span>
                    <span className="font-medium text-gray-900">{tax.toLocaleString('vi-VN')}₫</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end mb-6 pt-4 border-t border-gray-200">
                <span className="font-bold text-gray-900">Tổng cộng</span>
                <span className="font-bold text-primary-600 text-2xl leading-none">
                  {total.toLocaleString('vi-VN')}₫
                </span>
              </div>

              <button 
                type="submit"
                disabled={cartLoading || loading || items.length === 0}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white py-3.5 rounded-xl font-bold text-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center justify-center gap-2"
              >
                Đặt Hàng <ShieldCheck className="w-5 h-5"/>
              </button>
              <p className="text-center text-xs text-gray-500 mt-4">
                Bằng cách đặt hàng, bạn đồng ý với Điều khoản sử dụng của TechStore.
              </p>
            </div>
          </div>

        </form>
      </div>

    </div>
  );
};

export default Checkout;
