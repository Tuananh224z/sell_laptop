import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Trash2, Plus, Minus, X, CreditCard, Banknote, Smartphone, ChevronDown, Package, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'react-toastify';

/* ─── Types ─── */
interface Serial {
  _id: string;
  code: string;
  status: 'available' | 'sold' | 'defective' | 'reserved';
}

interface Variant {
  _id: string;
  label: string;
  sku: string;
  price: number;
  comparePrice: number;
  serials: Serial[];
}

interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  comparePrice: number;
  thumbnail: string;
  hasVariants: boolean;
  variants: Variant[];
  serials: Serial[];
  category: { _id: string; name: string };
  stock: number;
}

interface CartItem {
  productId: string;
  productName: string;
  img: string;
  variantId: string;
  variantLabel: string;
  serialCode: string;
  price: number;
  qty: number;
}

const CATEGORIES = ['Tất cả', 'Laptop', 'Màn hình', 'Phụ kiện', 'Linh kiện'];

/* ─── Select Serial Modal ─── */
const SelectModal = ({
  product, onConfirm, onClose,
}: {
  product: Product;
  onConfirm: (item: Omit<CartItem, 'qty'>) => void;
  onClose: () => void;
}) => {
  const [variantId, setVariantId] = useState<string>(
    product.hasVariants ? (product.variants[0]?._id || 'default') : 'default'
  );
  const [serialCode, setSerialCode] = useState('');

  const variant = product.hasVariants ? product.variants.find(v => v._id === variantId) : null;
  const price = variant ? variant.price : product.price;
  const serials = (variant ? variant.serials : product.serials).filter(s => s.status === 'available');

  const confirm = () => {
    if (!serialCode) return;
    onConfirm({
      productId: product._id,
      productName: product.name,
      img: product.thumbnail,
      variantId,
      variantLabel: variant ? variant.label : '',
      serialCode: serialCode,
      price,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-extrabold text-gray-900 text-base">Chọn sản phẩm</h2>
            <p className="text-xs text-gray-500 mt-0.5">{product.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-6 space-y-5">
          {product.hasVariants && (
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Biến thể</label>
              <div className="space-y-2">
                {product.variants.map(v => (
                  <label key={v._id} className={`flex items-center gap-3 border-2 rounded-xl p-3 cursor-pointer transition-all ${variantId === v._id ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input type="radio" name="variant" value={v._id} checked={variantId === v._id}
                      onChange={() => { setVariantId(v._id); setSerialCode(''); }} className="text-primary-600 focus:ring-primary-500" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">{v.label}</p>
                      <p className="text-xs text-primary-600 font-bold">{v.price.toLocaleString('vi-VN')}₫</p>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {v.serials.filter(s => s.status === 'available').length} tồn
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
              Chọn Serial Number <span className="font-normal text-gray-300">({serials.length} có sẵn)</span>
            </label>
            {serials.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-20" />
                Sản phẩm này hiện đã hết hàng
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {serials.map(s => (
                  <label key={s._id} className={`flex items-center gap-3 border-2 rounded-xl p-3 cursor-pointer transition-all ${serialCode === s.code ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input type="radio" name="serial" value={s.code} checked={serialCode === s.code}
                      onChange={() => setSerialCode(s.code)} className="text-primary-600 focus:ring-primary-500" />
                    <p className="text-sm font-bold text-gray-700 font-mono">{s.code}</p>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">Huỷ</button>
          <button disabled={!serialCode} onClick={confirm}
            className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-primary-100">
            <ShoppingCart className="w-4 h-4" /> Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Payment Modal ─── */
const PayModal = ({ total, cart, onClose, onSuccess }: { total: number; cart: CartItem[]; onClose: () => void; onSuccess: () => void }) => {
  const [method, setMethod] = useState<'cash' | 'transfer' | 'card'>('cash');
  const [received, setReceived] = useState('');
  const [loading, setLoading] = useState(false);
  
  const numReceived = Number(received.replace(/\D/g, '')) || 0;
  const change = method === 'cash' ? Math.max(0, numReceived - total) : 0;

  const handleComplete = async () => {
    setLoading(true);
    try {
      await api.post('/orders/admin/pos', {
        items: cart,
        paymentMethod: method,
        total,
      });
      toast.success('Thanh toán thành công!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi thanh toán');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900">Hoàn tất đơn hàng</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="bg-primary-600 rounded-2xl p-5 text-center text-white shadow-lg shadow-primary-200">
            <p className="text-xs opacity-80 font-bold uppercase tracking-widest">Tổng thanh toán</p>
            <p className="text-3xl font-black mt-1">{total.toLocaleString('vi-VN')}₫</p>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Phương thức thanh toán</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'cash', icon: Banknote, label: 'Tiền mặt' },
                { key: 'transfer', icon: Smartphone, label: 'Chuyển khoản' },
                { key: 'card', icon: CreditCard, label: 'Quẹt thẻ' },
              ].map(({ key, icon: Icon, label }) => (
                <button key={key} onClick={() => setMethod(key as any)}
                  className={`p-3 rounded-xl border-2 text-[10px] font-bold uppercase flex flex-col items-center gap-2 transition-all ${method === key ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                  <Icon className="w-5 h-5" />{label}
                </button>
              ))}
            </div>
          </div>

          {method === 'cash' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Tiền khách đưa</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={received} 
                    onChange={e => setReceived(e.target.value)} 
                    placeholder="Nhập số tiền..."
                    className="w-full border-2 border-gray-100 rounded-xl pl-4 pr-10 py-3 text-lg font-bold text-gray-900 focus:border-primary-500 outline-none transition-all" 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-300">₫</span>
                </div>
              </div>
              {numReceived >= total && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-sm font-medium text-green-700">Tiền thối lại:</span>
                  <span className="text-lg font-black text-green-600">{change.toLocaleString('vi-VN')}₫</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-3 px-6 py-4 bg-gray-50">
          <button onClick={onClose} className="flex-1 text-sm font-bold text-gray-500 hover:text-gray-700">Hủy</button>
          <button 
            onClick={handleComplete}
            disabled={loading || (method === 'cash' && numReceived < total)}
            className="flex-[2] bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl py-3 text-sm font-bold shadow-md shadow-primary-200 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xác nhận & In hóa đơn'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main POS ─── */
const AdminPOS = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectProduct, setSelectProduct] = useState<Product | null>(null);
  const [showPay, setShowPay] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products/admin/pos-search', {
        params: { search, category }
      });
      setProducts(data);
    } catch (err) {
      console.error('Fetch POS products failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 400);
    return () => clearTimeout(timer);
  }, [search, category]);

  const addToCart = (item: Omit<CartItem, 'qty'>) => {
    setCart(prev => {
      const exists = prev.find(c => c.serialCode === item.serialCode);
      if (exists) return prev; // Serial code must be unique in POS
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeItem = (serialCode: string) => setCart(prev => prev.filter(c => c.serialCode !== serialCode));

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);

  return (
    <div className="p-6 h-screen flex flex-col bg-gray-50/50">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Bán hàng tại quầy</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">POS — Point of Sale</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left: Product Browser */}
        <div className="lg:col-span-7 flex flex-col gap-4 min-h-0">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Tìm tên sản phẩm, mã SKU hoặc quét barcode..."
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 rounded-xl text-sm font-medium transition-all outline-none border" 
              />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${category === c ? 'bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-200' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p className="text-sm font-bold">Đang tìm sản phẩm...</p>
              </div>
            ) : products.length > 0 ? products.map(p => (
              <div key={p._id} className={`bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group ${p.stock === 0 ? 'opacity-60' : ''}`}>
                <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden">
                  {p.thumbnail ? <img src={p.thumbnail} alt="" className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-gray-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase bg-primary-50 text-primary-600 px-2 py-0.5 rounded-md">{p.category?.name}</span>
                    <span className="text-[10px] font-bold text-gray-400">#{p.sku}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm truncate">{p.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-primary-600 font-bold">{p.price.toLocaleString('vi-VN')}₫</span>
                    {p.comparePrice > p.price && <span className="text-xs text-gray-300 line-through">{p.comparePrice.toLocaleString('vi-VN')}₫</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-[10px] font-bold mb-2 ${p.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {p.stock > 0 ? `${p.stock} tồn` : 'Hết hàng'}
                  </p>
                  <button
                    onClick={() => setSelectProduct(p)}
                    disabled={p.stock === 0}
                    className="bg-gray-900 hover:bg-primary-600 disabled:bg-gray-100 disabled:text-gray-300 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-2 group-hover:scale-105"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm
                  </button>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-300">
                <Search className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-sm font-bold">Không tìm thấy sản phẩm nào</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Shopping Cart */}
        <div className="lg:col-span-5 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 min-h-0 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-200">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider">Đơn hàng</h3>
                <p className="text-[10px] font-bold text-gray-400">{cart.length} sản phẩm</p>
              </div>
            </div>
            <button onClick={() => setCart([])} className="text-xs font-bold text-red-500 hover:underline">Xóa tất cả</button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50 p-2 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 py-12">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                  <ShoppingCart className="w-6 h-6 text-gray-200" />
                </div>
                <p className="text-sm font-bold text-gray-400">Giỏ hàng đang trống</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.serialCode} className="p-4 flex items-start gap-4 animate-in slide-in-from-right-4 duration-200">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                    {item.img ? <img src={item.img} alt="" className="w-full h-full object-cover" /> : <Package className="w-5 h-5 m-3.5 text-gray-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 leading-tight">{item.productName}</p>
                    {item.variantLabel && <p className="text-[10px] font-bold text-primary-500 mt-0.5">{item.variantLabel}</p>}
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">SN: {item.serialCode}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <button onClick={() => removeItem(item.serialCode)} className="p-1 hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors rounded-lg mb-2">
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-sm font-bold text-gray-900">{item.price.toLocaleString('vi-VN')}₫</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-gray-50/80 border-t border-gray-100 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 font-bold uppercase text-[10px]">Tạm tính</span>
                <span className="font-bold text-gray-900">{total.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200/50">
                <span className="text-gray-900 font-bold uppercase text-xs">Tổng cộng</span>
                <span className="text-xl font-black text-primary-600">{total.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>
            <button 
              disabled={cart.length === 0}
              onClick={() => setShowPay(true)} 
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl py-3.5 font-bold text-sm shadow-lg shadow-primary-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-wider"
            >
              <CreditCard className="w-5 h-5" /> Thanh toán
            </button>
          </div>
        </div>
      </div>

      {selectProduct && <SelectModal product={selectProduct} onConfirm={addToCart} onClose={() => setSelectProduct(null)} />}
      {showPay && (
        <PayModal 
          total={total} 
          cart={cart} 
          onClose={() => setShowPay(false)} 
          onSuccess={() => setCart([])} 
        />
      )}
    </div>
  );
};

export default AdminPOS;
