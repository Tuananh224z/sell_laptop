import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, ChevronDown, X, ChevronLeft, ChevronRight, LayoutGrid, List, ShoppingCart, Heart, Eye, ShoppingBag } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const getImgUrl = (src: string) => {
  const fallback = 'https://placehold.co/250x250/f3f4f6/9ca3af?text=Product';
  if (!src) return fallback;
  if (/^https?:\/\//.test(src)) return src;
  const path = src.startsWith('/') ? src : `/${src}`;
  return `${BACKEND}${path}`;
};

const getEffectivePrice = (p: any) => {
  if (p.price > 0) return { price: p.price, comparePrice: p.comparePrice };
  if (p.hasVariants && p.variants?.length > 0) {
    const v = p.variants[0];
    return { price: v.price || 0, comparePrice: v.comparePrice || 0 };
  }
  return { price: 0, comparePrice: 0 };
};

const sortOptions = [
  { id: 'popular',    label: 'Phổ biến nhất' },
  { id: 'newest',     label: 'Mới nhất' },
  { id: 'price_asc',  label: 'Giá tăng dần' },
  { id: 'price_desc', label: 'Giá giảm dần' },
  { id: 'rating',     label: 'Đánh giá cao' },
];

const priceRanges = [
  { label: 'Dưới 5 triệu',    min: 0,         max: 5000000 },
  { label: '5 – 20 triệu',    min: 5000000,   max: 20000000 },
  { label: '20 – 50 triệu',   min: 20000000,  max: 50000000 },
  { label: 'Trên 50 triệu',   min: 50000000,  max: 999999999 },
];

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ p, listView, wished, onWishToggle, onAddToCart }: {
  p: any; listView: boolean; wished: boolean;
  onWishToggle: (p: any, e: React.MouseEvent) => void;
  onAddToCart: (p: any, e: React.MouseEvent) => void;
}) => {
  const { price, comparePrice } = getEffectivePrice(p);
  const discount = comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
  const inStock = p.stock > 0;

  if (listView) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex gap-4 p-4 hover:shadow-md transition-shadow group relative">
        <div className="relative shrink-0 w-32 h-28 bg-white flex items-center justify-center rounded-xl border border-gray-100 overflow-hidden">
          {discount > 0 && (
            <span className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10">-{discount}%</span>
          )}
          <img
            src={getImgUrl(p.thumbnail || p.images?.[0])}
            alt={p.name}
            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
            onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/120x90/f3f4f6/9ca3af?text=Product'; }}
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <Link to={`/product/${p._id}`}>
              <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 text-sm">{p.name}</h3>
            </Link>
            <p className="text-xs text-gray-500 line-clamp-1 mt-1">{p.shortDesc || ''}</p>
            <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1.5">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-3 h-3 fill-current" />
                <span className="font-medium">{p.rating || 5.0}</span>
                <span className="text-gray-400">({p.reviewCount || 0})</span>
              </div>
              <div className="flex items-center gap-1"><Eye className="w-3 h-3" /><span>{p.views || 0}</span></div>
              <div className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" /><span>Đã bán {p.soldCount || 0}</span></div>
              {!inStock && <span className="text-red-500 font-medium">Hết hàng</span>}
            </div>
          </div>
          <div className="flex items-end justify-between mt-2">
            <div className="flex flex-col">
              <span className="text-primary-600 font-bold text-base leading-tight">{price.toLocaleString('vi-VN')}₫</span>
              {comparePrice > price && <span className="text-gray-400 text-xs line-through">{comparePrice.toLocaleString('vi-VN')}₫</span>}
            </div>
            <button disabled={!inStock} onClick={(e) => onAddToCart(p, e)} title="Thêm vào giỏ hàng" className="bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white disabled:opacity-40 p-2.5 rounded-xl transition-colors shadow-sm border border-primary-100">
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>
        <button
          onClick={(e) => onWishToggle(p, e)}
          className={`absolute top-3 right-3 p-2 rounded-full bg-white/80 shadow-sm transition-all opacity-0 group-hover:opacity-100 ${wished ? 'text-red-500 opacity-100' : 'text-gray-400 hover:text-red-500'}`}
        >
          <Heart className={`w-4 h-4 ${wished ? 'fill-red-500' : ''}`} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 group relative flex flex-col">
      <button
        onClick={(e) => onWishToggle(p, e)}
        className={`absolute top-3 right-3 z-30 p-2 rounded-full shadow-sm bg-white/80 backdrop-blur-sm transition-all ${wished ? 'text-red-500 opacity-100 translate-y-0' : 'text-gray-400 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 hover:text-red-500'}`}
      >
        <Heart className={`w-5 h-5 ${wished ? 'fill-red-500' : ''}`} />
      </button>

      <div className="relative overflow-hidden aspect-[4/3] p-6 bg-white flex items-center justify-center">
        {(discount > 0 || !inStock) && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
            {!inStock ? 'Hết' : `-${discount}%`}
          </span>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-white/60 z-20 flex items-center justify-center">
            <span className="bg-gray-700 text-white text-xs font-bold px-3 py-1 rounded-full">Hết hàng</span>
          </div>
        )}
        <img
          src={getImgUrl(p.thumbnail || p.images?.[0])}
          alt={p.name}
          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
          onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/300x220/f3f4f6/9ca3af?text=Product'; }}
        />
      </div>

      <div className="p-4 border-t border-gray-50 flex-grow flex flex-col">
        <Link to={`/product/${p._id}`} className="block">
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 hover:text-primary-600 transition-colors">{p.name}</h3>
        </Link>
        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{p.shortDesc || ''}</p>

        <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-3">
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="w-3 h-3 fill-current" />
            <span className="font-medium">{p.rating || 5.0}</span>
            <span className="text-gray-400">({p.reviewCount || 0})</span>
          </div>
          <div className="flex items-center gap-1"><Eye className="w-3 h-3" /><span>{p.views || 0}</span></div>
          <div className="flex items-center gap-1 truncate"><ShoppingBag className="w-3 h-3 shrink-0" /><span className="truncate">Đã bán {p.soldCount || 0}</span></div>
        </div>

        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-primary-600 font-bold text-lg leading-tight">{price.toLocaleString('vi-VN')}₫</span>
            {comparePrice > price && <span className="text-gray-400 text-sm line-through decoration-gray-300">{comparePrice.toLocaleString('vi-VN')}₫</span>}
          </div>
          <button disabled={!inStock} onClick={(e) => onAddToCart(p, e)} title="Thêm vào giỏ hàng" className="bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white disabled:opacity-40 p-2.5 rounded-xl transition-colors self-end shadow-sm border border-primary-100">
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const Products = () => {
  const { user, setUser } = useAuth();
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts]         = useState<any[]>([]);
  const [total, setTotal]               = useState(0);
  const [loadingProducts, setLoading]   = useState(true);
  const [categories, setCategories]     = useState<any[]>([]);
  const [brands, setBrandList]          = useState<any[]>([]);

  const [search, setSearch]             = useState(searchParams.get('search') || '');

  // Sync state with URL params (e.g. when searching from Header)
  useEffect(() => {
    const q = searchParams.get('search') || '';
    setSearch(q);
  }, [searchParams]);
  const [activeCategory, setCategory]   = useState(searchParams.get('category') || 'all');
  const [selectedBrands, setSelBrands]  = useState<string[]>(searchParams.get('brand') ? [searchParams.get('brand')!] : []);
  const [priceMin, setPriceMin]         = useState(0);
  const [priceMax, setPriceMax]         = useState(999999999);
  const [sortBy, setSortBy]             = useState('popular');
  const [showFilter, setShowFilter]     = useState(false);
  const [listView, setListView]         = useState(false);
  const [page, setPage]                 = useState(1);
  const perPage = 9;

  // Load categories & brands
  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.categories || r.data)).catch(() => {});
    api.get('/brands').then(r => setBrandList(r.data.brands || r.data)).catch(() => {});
  }, []);

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        limit: perPage,
        page,
        status: 'active',
      };
      if (search) params.search = search;
      if (activeCategory !== 'all') params.category = activeCategory;
      if (selectedBrands.length === 1) params.brand = selectedBrands[0];
      if (priceMin > 0) params.minPrice = priceMin;
      if (priceMax < 999999999) params.maxPrice = priceMax;
      if (sortBy === 'price_asc')  { params.sortBy = 'price'; params.sortOrder = 'asc'; }
      if (sortBy === 'price_desc') { params.sortBy = 'price'; params.sortOrder = 'desc'; }
      if (sortBy === 'newest')     { params.sortBy = 'createdAt'; params.sortOrder = 'desc'; }
      if (sortBy === 'rating')     { params.sortBy = 'rating'; params.sortOrder = 'desc'; }

      const { data } = await api.get('/products', { params });
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi tải danh sách sản phẩm!');
    } finally {
      setLoading(false);
    }
  }, [page, search, activeCategory, selectedBrands, priceMin, priceMax, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleWishlist = async (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { toast.warning('Vui lòng đăng nhập để lưu sản phẩm!'); return; }
    try {
      const res = await api.post(`/auth/wishlist/${product._id}`);
      setUser({ ...user, wishlist: res.data.wishlist });
      const isFav = res.data.wishlist.includes(product._id);
      if (isFav) toast.success('Đã thêm vào danh sách yêu thích');
      else toast.success('Đã xóa khỏi danh sách yêu thích');
    } catch { toast.error('Có lỗi xảy ra!'); }
  };

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product._id);
  };

  const isWished = (productId: string) =>
    user?.wishlist?.some(w => (typeof w === 'string' ? w : (w as any)._id) === productId) ?? false;

  const toggleBrand = (slug: string) =>
    setSelBrands(prev => prev.includes(slug) ? prev.filter(x => x !== slug) : [...prev, slug]);

  const clearFilters = () => {
    setCategory('all');
    setSelBrands([]);
    setPriceMin(0);
    setPriceMax(999999999);
    setSearch('');
    setPage(1);
  };

  const totalPages = Math.ceil(total / perPage);
  const activeFilterCount = (activeCategory !== 'all' ? 1 : 0) + selectedBrands.length + (priceMin > 0 || priceMax < 999999999 ? 1 : 0);

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3">Danh mục</h3>
        <ul className="space-y-1.5">
          <li>
            <button
              onClick={() => { setCategory('all'); setPage(1); }}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${activeCategory === 'all' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Tất cả
            </button>
          </li>
          {categories.map((c: any) => (
            <li key={c._id}>
              <button
                onClick={() => { setCategory(c.slug); setPage(1); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${activeCategory === c.slug ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Brand */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3">Thương hiệu</h3>
        <div className="flex flex-wrap gap-2">
          {brands.map((b: any) => (
            <button
              key={b._id}
              onClick={() => { toggleBrand(b.slug); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${selectedBrands.includes(b.slug) ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3">Khoảng giá</h3>
        <div className="space-y-2">
          {priceRanges.map(({ label, min, max }) => (
            <button
              key={label}
              onClick={() => { setPriceMin(min); setPriceMax(max); setPage(1); }}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${priceMin === min && priceMax === max ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {label}
            </button>
          ))}
          <button onClick={() => { setPriceMin(0); setPriceMax(999999999); }} className="text-xs text-primary-600 hover:underline pl-3">
            Xoá khoảng giá
          </button>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button onClick={clearFilters} className="w-full flex items-center justify-center gap-1.5 text-sm text-red-500 hover:text-red-600 border border-red-200 hover:border-red-300 rounded-xl py-2 transition-colors">
          <X className="w-4 h-4" /> Xoá tất cả bộ lọc
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="max-w-[1200px] mx-auto px-4 pt-6">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 flex items-center gap-1 mb-5">
          <Link to="/" className="hover:text-primary-600">Trang chủ</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Tất cả sản phẩm</span>
        </nav>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Bộ lọc</h2>
                {activeFilterCount > 0 && (
                  <span className="text-xs bg-primary-600 text-white font-bold px-2 py-0.5 rounded-full">{activeFilterCount}</span>
                )}
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3 mb-5 flex-wrap">
              <div className="relative flex-1 min-w-[160px] lg:hidden">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Tìm trong danh sách..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <button onClick={() => setShowFilter(true)} className="lg:hidden flex items-center gap-1.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl px-3 py-2">
                <SlidersHorizontal className="w-4 h-4" />
                Lọc
                {activeFilterCount > 0 && <span className="bg-primary-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>}
              </button>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => { setSortBy(e.target.value); setPage(1); }}
                  className="appearance-none border border-gray-200 rounded-xl text-sm px-3 py-2 pr-8 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-700 font-medium cursor-pointer"
                >
                  {sortOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setListView(false)} className={`p-2 transition-colors ${!listView ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-50'}`}>
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setListView(true)} className={`p-2 transition-colors ${listView ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-50'}`}>
                  <List className="w-4 h-4" />
                </button>
              </div>

              <span className="text-xs text-gray-500 ml-auto">{total} sản phẩm</span>
            </div>

            {/* Products Grid / List */}
            {loadingProducts ? (
              <div className={listView ? 'space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'}>
                {[...Array(perPage)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 animate-pulse h-72" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className={listView ? 'space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'}>
                {products.map(p => (
                  <ProductCard
                    key={p._id}
                    p={p}
                    listView={listView}
                    wished={isWished(p._id)}
                    onWishToggle={toggleWishlist}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
                <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Không tìm thấy sản phẩm phù hợp</p>
                <button onClick={clearFilters} className="mt-3 text-sm text-primary-600 hover:underline">Xoá bộ lọc</button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)} className={`w-9 h-9 rounded-xl border text-sm font-semibold transition-colors ${n === page ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {n}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showFilter && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilter(false)} />
          <div className="relative ml-auto w-72 bg-white h-full overflow-y-auto p-5 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 text-lg">Bộ lọc</h2>
              <button onClick={() => setShowFilter(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterPanel />
            <button onClick={() => setShowFilter(false)} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl mt-6 transition-colors">
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
