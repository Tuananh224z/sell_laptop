import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const getImgUrl = (src: string) => {
  if (!src) return 'https://placehold.co/80x80/f3f4f6/9ca3af?text=No+Image';
  if (src.startsWith('http')) return src;
  return `${BACKEND}${src}`;
};

const getEffectivePrice = (item: any) => {
  if (item.price > 0) return { price: item.price, comparePrice: item.comparePrice };
  if (item.hasVariants && item.variants?.length > 0) {
    const v = item.variants[0];
    return { price: v.price || 0, comparePrice: v.comparePrice || 0 };
  }
  return { price: 0, comparePrice: 0 };
};

const ProfileFavorites = () => {
  const { user, setUser } = useAuth();
  const { addToCart } = useCart();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/auth/wishlist');
      setFavorites(data);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải danh sách yêu thích!');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id: string) => {
    try {
      const { data } = await api.post(`/auth/wishlist/${id}`);
      setFavorites(prev => prev.filter(f => f._id !== id));
      if (user) {
        setUser({ ...user, wishlist: data.wishlist });
      }
      toast.success('Đã xóa khỏi danh sách yêu thích');
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra!');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
      <div className="mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
        <Heart className="w-6 h-6 text-primary-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-900">Sản phẩm yêu thích</h2>
          <p className="text-sm text-gray-500 mt-1">Lưu trữ các sản phẩm bạn quan tâm ({favorites.length})</p>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-gray-500 text-center py-8">Đang tải...</p>
        ) : favorites.map((item) => (
          <div key={item._id} className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border border-gray-100 p-4 rounded-xl hover:border-primary-100 transition-colors">
            
            <div className="flex gap-4 flex-1">
              <Link to={`/product/${item._id}`} className="shrink-0">
                <img
                  src={getImgUrl(item.thumbnail || item.images?.[0])}
                  alt={item.name}
                  className="w-20 h-20 object-contain rounded-lg border border-gray-100 bg-gray-50"
                  onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/80x80/f3f4f6/9ca3af?text=No+Image'; }}
                />
              </Link>
              <div className="flex flex-col justify-center">
                <Link to={`/product/${item._id}`} className="font-bold text-gray-900 hover:text-primary-600 line-clamp-2 mb-1">
                  {item.name}
                </Link>
                <div className="flex items-center gap-2">
                  {(() => {
                    const { price, comparePrice } = getEffectivePrice(item);
                    return (
                      <>
                        <span className="font-bold text-primary-600">{price.toLocaleString('vi-VN')}₫</span>
                        {comparePrice > price && (
                          <span className="text-xs text-gray-400 line-through">{comparePrice.toLocaleString('vi-VN')}₫</span>
                        )}
                      </>
                    );
                  })()}
                </div>
                <div className="mt-2">
                   {item.stock > 0 ? (
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">Còn hàng</span>
                   ) : (
                      <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">Hết hàng</span>
                   )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
              <button 
                onClick={() => removeFavorite(item._id)}
                className="flex items-center justify-center p-2 border border-gray-200 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                title="Xóa khỏi danh sách"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button 
                disabled={item.stock <= 0}
                onClick={() => addToCart(item._id)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  item.stock > 0 
                    ? 'bg-primary-600 text-white hover:bg-primary-700' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="w-4 h-4" /> Thêm vào Giỏ
              </button>
            </div>

          </div>
        ))}

        {!loading && favorites.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Danh sách yêu thích của bạn đang trống</p>
            <Link to="/" className="inline-block bg-primary-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-primary-700">
              Về Trang Chủ Khám Phá
            </Link>
          </div>
        )}
      </div>

    </div>
  );
};

export default ProfileFavorites;
