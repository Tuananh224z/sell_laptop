import { useState, useRef, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, Package, Heart, MapPin, LogOut, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useCategories } from '../../hooks/useCategories';
import api from '../../lib/api';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const getAvatar = (url?: string) => url ? (url.startsWith('http') ? url : `${BACKEND}${url}`) : null;
const getImgUrl = (src: string) => {
  const fallback = 'https://placehold.co/80x80/f3f4f6/9ca3af?text=No+Image';
  if (!src) return fallback;
  if (/^https?:\/\//.test(src)) return src;
  const path = src.startsWith('/') ? src : `/${src}`;
  return `${BACKEND}${path}`;
};

const Header = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const { categories } = useCategories();

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search logic
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSearch(true);
      try {
        const { data } = await api.get(`/products?name=${searchTerm}&limit=6`);
        setSuggestions(data.products || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoadingSearch(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${searchTerm}`);
      setShowSuggestions(false);
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      {/* Top bar */}
      <div className="bg-primary-700 text-white text-sm py-1">
        <div className="max-w-[1200px] mx-auto px-4 flex justify-between items-center">
          <p>Hỗ trợ trực tuyến 24/7. Hotline: <strong>{settings?.phone || '0123 456 789'}</strong></p>
          {/* <div className="flex space-x-4">
            <a href="#" className="hover:text-primary-200">Tin tức</a>
            <a href="#" className="hover:text-primary-200">Tuyển dụng</a>
            <a href="#" className="hover:text-primary-200">Liên hệ</a>
          </div> */}
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-[1200px] mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-primary-600 hover:opacity-90 transition-opacity">
            {settings?.logo ? (
              <img 
                src={`${BACKEND}${settings.logo}`} 
                alt={settings.siteName || 'Logo'} 
                className="h-10 w-auto object-contain"
              />
            ) : (
              <>
                <div className="bg-primary-600 text-white p-2 rounded-lg font-bold text-xl leading-none">TS</div>
                <span className="text-2xl font-bold tracking-tight hidden sm:block">{settings?.siteName || 'TechStore'}</span>
              </>
            )}
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-4 relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                className="w-full pl-4 pr-12 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 shadow-sm"
              />
              <button 
                type="submit"
                className="absolute right-0 top-0 h-full px-4 text-gray-500 hover:text-primary-600 rounded-r-full"
                aria-label="Search"
              >
                {loadingSearch ? (
                  <div className="w-5 h-5 border-2 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
                ) : (
                  <Search size={20} />
                )}
              </button>
            </form>

            {/* Search Suggestions */}
            {showSuggestions && (suggestions.length > 0 || loadingSearch) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[60]">
                <div className="max-h-[400px] overflow-y-auto">
                  {loadingSearch && suggestions.length === 0 ? (
                    <div className="p-8 flex flex-col items-center gap-3 text-gray-500">
                      <div className="w-8 h-8 border-4 border-gray-100 border-t-primary-600 rounded-full animate-spin" />
                      <p className="text-sm">Đang tìm kiếm sản phẩm...</p>
                    </div>
                  ) : (
                    <>
                      {suggestions.map((p) => (
                        <Link 
                          key={p._id}
                          to={`/product/${p._id}`}
                          onClick={() => setShowSuggestions(false)}
                          className="flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                        >
                          <div className="w-12 h-12 rounded-lg border border-gray-100 flex items-center justify-center shrink-0 bg-gray-50 overflow-hidden p-1">
                            <img src={getImgUrl(p.thumbnail)} alt={p.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{p.name}</h4>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-sm font-bold text-primary-600">{p.price.toLocaleString('vi-VN')}₫</span>
                              {p.comparePrice > p.price && (
                                <span className="text-xs text-gray-400 line-through">{(p.comparePrice).toLocaleString('vi-VN')}₫</span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                      
                      {suggestions.length === 0 && !loadingSearch && (
                        <div className="p-8 text-center text-gray-500">
                          Không tìm thấy sản phẩm nào khớp với "{searchTerm}"
                        </div>
                      )}
                    </>
                  )}

                  {searchTerm.trim() && !loadingSearch && (
                    <Link 
                      to={`/products?search=${searchTerm}`}
                      onClick={() => setShowSuggestions(false)}
                      className="block p-3 bg-gray-50 text-center text-sm font-semibold text-primary-600 hover:text-primary-700 hover:bg-gray-100 transition-colors"
                    >
                      Xem tất cả kết quả cho "{searchTerm}"
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            {/* Account */}
            {user ? (
              <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex flex-col items-center justify-center cursor-pointer hover:text-primary-600 group"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white group-hover:ring-primary-200 transition-all flex items-center justify-center">
                    {getAvatar(user.avatar)
                      ? <img src={getAvatar(user.avatar)!} alt={user.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm uppercase">{user.initials}</div>
                    }
                  </div>
                  <span className="text-sm font-medium mt-1 text-gray-700 group-hover:text-primary-600 transition-colors max-w-[120px] truncate">{user.name}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{user.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors">
                      <User className="w-4 h-4" /> Hồ sơ của tôi
                    </Link>
                    <Link to="/profile/orders" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors">
                      <Package className="w-4 h-4" /> Đơn hàng của tôi
                    </Link>
                    <Link to="/profile/favorites" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors">
                      <Heart className="w-4 h-4" /> Sản phẩm yêu thích
                    </Link>
                    <Link to="/profile/addresses" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors">
                      <MapPin className="w-4 h-4" /> Địa chỉ của tôi
                    </Link>
                    {/* Admin only */}
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-violet-700 hover:bg-violet-50 transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Trang quản trị
                      </Link>
                    )}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut className="w-4 h-4" /> Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hidden md:flex flex-col items-center justify-center cursor-pointer hover:text-primary-600 group">
                <User size={24} className="group-hover:text-primary-600 text-gray-700 transition-colors" />
                <span className="text-sm font-medium mt-1">Đăng nhập</span>
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="flex flex-col items-center justify-center cursor-pointer hover:text-primary-600 group relative">
              <div className="relative">
                <ShoppingCart size={24} className="group-hover:text-primary-600 text-gray-700 transition-colors" />
                {cart.itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                    {cart.itemCount > 99 ? '99+' : cart.itemCount}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium mt-1 hidden md:block">Giỏ hàng</span>
            </Link>
            
            {/* Mobile Menu Toggle */}
            <button className="md:hidden text-gray-700">
              <Menu size={28} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="border-t border-gray-100 hidden md:block">
        <div className="max-w-[1200px] mx-auto px-4">
          <ul className="flex items-center gap-6 py-3 text-sm font-medium text-gray-700 overflow-x-auto">
            <li className="flex items-center gap-2 hover:text-primary-600 cursor-pointer text-primary-600 shrink-0">
              <Menu size={20} />
              <span>DANH MỤC SẢN PHẨM</span>
            </li>
            {categories.map(cat => (
              <li key={cat._id} className="shrink-0">
                <Link
                  to={`/products?category=${cat.slug}`}
                  className="hover:text-primary-600 transition-colors block py-1 uppercase whitespace-nowrap"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
