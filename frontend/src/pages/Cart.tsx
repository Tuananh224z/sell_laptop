import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const getImgUrl = (src: string) => {
  const fallback = 'https://placehold.co/80x80/f3f4f6/9ca3af?text=No+Image';
  if (!src) return fallback;
  if (/^https?:\/\//.test(src)) return src;
  const path = src.startsWith('/') ? src : `/${src}`;
  return `${BACKEND}${path}`;
};

const Cart = () => {
  const { cart, loading, updateItem, removeItem } = useCart();
  const { items, itemCount, subtotal } = cart;

  const totalSavings = items.reduce((acc, item) =>
    acc + Math.max(0, item.comparePrice - item.price) * item.quantity, 0
  );

  if (items.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center p-6 bg-gray-50 rounded-full mb-6">
          <ShoppingBag className="w-16 h-16 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng của bạn đang trống</h2>
        <p className="text-gray-500 mb-8">Hãy chọn thêm sản phẩm vào giỏ hàng nhé!</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-primary-600">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Giỏ hàng ({itemCount})</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Giỏ hàng của bạn</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items List */}
          <div className="lg:w-2/3 flex flex-col gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hidden md:grid grid-cols-12 gap-4 p-4 text-sm font-medium text-gray-500 bg-gray-50">
              <div className="col-span-6">Sản phẩm</div>
              <div className="col-span-2 text-center">Đơn giá</div>
              <div className="col-span-2 text-center">Số lượng</div>
              <div className="col-span-2 text-right">Thành tiền</div>
            </div>

            {items.map((item) => (
              <div key={item._id} className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-opacity ${loading ? 'opacity-60 pointer-events-none' : ''}`}>
                <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center">

                  {/* Product Info */}
                  <div className="col-span-6 flex items-start gap-4 w-full">
                    <Link to={`/product/${item.productId}`} className="shrink-0">
                      <img
                        src={getImgUrl(item.thumbnail)}
                        alt={item.name}
                        className="w-20 h-20 object-contain rounded border border-gray-100 bg-gray-50"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/80x80/f3f4f6/9ca3af?text=No+Image'; }}
                      />
                    </Link>
                    <div className="flex-1">
                      <Link to={`/product/${item.productId}`} className="font-medium text-gray-900 hover:text-primary-600 line-clamp-2 mb-1">
                        {item.name}
                      </Link>
                      {item.variantLabel && (
                        <p className="text-xs text-gray-500 mb-1">Phiên bản: {item.variantLabel}</p>
                      )}
                      <button
                        onClick={() => removeItem(item._id)}
                        className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1 font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Xóa
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 w-full md:w-auto flex md:flex-col justify-between md:justify-center items-center text-center pt-2 md:pt-0 border-t border-gray-50 md:border-0">
                    <span className="md:hidden text-gray-500 text-sm">Đơn giá:</span>
                    <div className="flex flex-col items-end md:items-center">
                      <span className="font-bold text-gray-900">{item.price.toLocaleString('vi-VN')}₫</span>
                      {item.comparePrice > item.price && (
                        <span className="text-xs text-gray-400 line-through">{item.comparePrice.toLocaleString('vi-VN')}₫</span>
                      )}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2 w-full md:w-auto flex justify-between md:justify-center items-center py-2 md:py-0">
                    <span className="md:hidden text-gray-500 text-sm">Số lượng:</span>
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateItem(item._id, item.quantity - 1)}
                        className="p-1 px-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 focus:outline-none transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item._id, item.quantity + 1)}
                        className="p-1 px-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 focus:outline-none transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="col-span-2 w-full md:w-auto flex justify-between md:justify-end items-center pt-2 md:pt-0 border-t border-gray-50 md:border-0">
                    <span className="md:hidden text-gray-500 text-sm">Thành tiền:</span>
                    <span className="font-bold text-primary-600 text-lg">
                      {item.subtotal.toLocaleString('vi-VN')}₫
                    </span>
                  </div>

                </div>
              </div>
            ))}

            {/* Continue shopping */}
            <div className="mt-4 hidden md:block">
              <Link to="/products" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium">
                <ArrowLeft className="w-4 h-4" /> Tiếp tục mua sắm
              </Link>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính ({itemCount} sản phẩm)</span>
                  <span className="font-medium text-gray-900">{subtotal.toLocaleString('vi-VN')}₫</span>
                </div>

                {totalSavings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Tiết kiệm</span>
                    <span className="font-medium">- {totalSavings.toLocaleString('vi-VN')}₫</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600 pt-4 border-t border-gray-100">
                  <span>Phí vận chuyển</span>
                  <span>Tính khi thanh toán</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8 pt-4 border-t border-gray-200">
                <span className="font-bold text-gray-900 text-lg">Tổng tiền</span>
                <div className="text-right">
                  <span className="font-bold text-primary-600 text-2xl leading-none">
                    {subtotal.toLocaleString('vi-VN')}₫
                  </span>
                  <p className="text-xs text-gray-500 mt-1">(Đã bao gồm VAT nếu có)</p>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white py-3.5 rounded-xl font-bold text-lg transition-colors shadow-sm"
              >
                Tiến Hành Đặt Hàng
              </Link>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                Thanh toán an toàn, bảo mật
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;
