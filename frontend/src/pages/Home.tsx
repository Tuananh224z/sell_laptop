import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Eye,
  Star,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { useCategories } from "../hooks/useCategories";
import { useBrands, getBrandLogo } from "../hooks/useBrands";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
const DEFAULT_CAT_IMG =
  "https://placehold.co/80x80/f3f4f6/9ca3af?text=No+Image";
const DEFAULT_BRAND_IMG =
  "https://placehold.co/100x50/f3f4f6/9ca3af?text=No+Logo";
const DEFAULT_PRODUCT_IMG =
  "https://placehold.co/250x250/f3f4f6/9ca3af?text=Product";

import { useState, useEffect } from "react";
import { productService } from "../services/productService";
import { settingService } from "../services/settingService";
import { authService } from "../services/authService";

const BACKEND =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
const getImgUrl = (src: string, fallback: string) => {
  if (!src) return fallback;
  if (/^https?:\/\//.test(src)) return src;
  const path = src.startsWith("/") ? src : `/${src}`;
  return `${BACKEND}${path}`;
};

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  comparePrice: number;
  tierDiscount?: number;
  thumbnail: string;
  images: string[];
  shortDesc?: string;
  brand?: { _id: string; name: string; logo?: string };
  category?: { _id: string; name: string };
  rating: number;
  reviews?: number;
  views?: number;
  soldCount?: number;
  purchases?: number;
  numReviews: number;
  isFeatured: boolean;
  status: string;
}

const Home = () => {
  const { user, setUser } = useAuth();
  const { addToCart } = useCart();
  const { categories, loading: catLoading } = useCategories();
  const { brands, loading: brandLoading } = useBrands();

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    settingService.getSettings()
      .then((res) => setSettings(res.data))
      .catch(() => {});
  }, []);

  const toggleWishlist = async (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.warning("Vui lòng đăng nhập để lưu sản phẩm!");
      return;
    }
    try {
      const res = await authService.toggleWishlist(product._id);
      const newWishlist = res.data.wishlist;
      setUser({ ...user, wishlist: newWishlist });
      const isFav = newWishlist.some((w: any) => (w._id || w) === product._id);
      if (isFav) {
        toast.success("Đã thêm vào danh sách yêu thích");
      } else {
        toast.info("Đã xóa khỏi danh sách yêu thích");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  useEffect(() => {
    productService.getAll({ isFeatured: true, status: "active", limit: 8 })
      .then((r) => setFeaturedProducts(r.data.products))
      .catch((err: any) => console.error(err))
      .finally(() => setLoadingProducts(false));
  }, []);

  const isProductInWishlist = (productId: string) => {
    return user?.wishlist?.some((w: any) => (w._id || w) === productId);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Banner Section */}
      <section className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 relative h-[300px] md:h-[400px] rounded-xl overflow-hidden shadow-md group">
            <img
              src={
                settings?.banner1
                  ? `${BACKEND}${settings.banner1}`
                  : "https://placehold.co/800x400/e50027/ffffff?text=SUMMER+SALE+Up+To+50%25"
              }
              alt="Main Banner"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
              <h2 className="text-white text-3xl font-bold mb-2">
                {settings?.banner1Title ||
                  (settings?.banner1 ? "" : "Đại Tiệc Mùa Hè")}
              </h2>
              <p className="text-white text-lg mb-4">
                {settings?.banner1Sub ||
                  (settings?.banner1
                    ? ""
                    : "Giảm giá lên đến 50% tất cả các mặt hàng")}
              </p>
              <Link to="/products" className="btn-primary w-max block">
                Mua Ngay
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="h-[142px] md:h-[192px] rounded-xl overflow-hidden shadow-md relative group">
              <img
                src={
                  settings?.banner2
                    ? `${BACKEND}${settings.banner2}`
                    : "https://placehold.co/400x200/333333/ffffff?text=GAMING+LAPTOP"
                }
                alt="Sub Banner 1"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex flex-col justify-end p-4">
                <h3 className="text-white font-bold text-sm">
                  {settings?.banner2Title}
                </h3>
                <p className="text-white/80 text-[10px] line-clamp-1">
                  {settings?.banner2Sub}
                </p>
              </div>
            </div>
            <div className="h-[142px] md:h-[192px] rounded-xl overflow-hidden shadow-md relative group">
              <img
                src={
                  settings?.banner3
                    ? `${BACKEND}${settings.banner3}`
                    : "https://placehold.co/400x200/111111/ffffff?text=PC+BUILD"
                }
                alt="Sub Banner 2"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex flex-col justify-end p-4">
                <h3 className="text-white font-bold text-sm">
                  {settings?.banner3Title}
                </h3>
                <p className="text-white/80 text-[10px] line-clamp-1">
                  {settings?.banner3Sub}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-[1200px] mx-auto px-4 py-8">
        <h2 className="section-title">Danh Mục Nổi Bật</h2>
        {catLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-xl shadow-sm animate-pulse flex flex-col items-center gap-2"
              >
                <div className="w-16 h-16 rounded-full bg-gray-200" />
                <div className="h-3 w-14 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat.slug}`}
                className="bg-white p-4 rounded-xl shadow-sm text-center cursor-pointer hover:shadow-md hover:border-primary-500 border border-transparent transition-all group flex flex-col items-center"
              >
                <div className="mb-3 w-16 h-16 rounded-full overflow-hidden flex items-center justify-center group-hover:-translate-y-2 transition-transform shadow-sm border border-gray-100 bg-gray-50 text-3xl">
                  <img
                    src={getImgUrl(cat.image, DEFAULT_CAT_IMG)}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_CAT_IMG;
                    }}
                  />
                </div>
                <h3 className="font-medium text-sm text-gray-800">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-gray-900 relative pb-2 uppercase">
            Sản Phẩm <span className="text-primary-600">Nổi Bật</span>
            <span className="absolute bottom-0 left-0 w-16 h-1 bg-primary-600 rounded-full"></span>
          </h2>
          <Link
            to="/products"
            className="text-primary-600 hover:text-primary-800 font-medium text-sm flex items-center gap-1 group"
          >
            Xem tất cả{" "}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loadingProducts ? (
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-[380px] animate-pulse flex flex-col"
              >
                <div className="w-full aspect-square bg-gray-100 rounded-lg mb-4" />
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-5 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-auto" />
                <div className="h-6 bg-gray-200 rounded w-1/2 mt-4" />
              </div>
            ))
          ) : featuredProducts.length === 0 ? (
            <p className="text-gray-500 col-span-full py-8 text-center bg-white rounded-xl border border-gray-100">
              Chưa có sản phẩm nổi bật nào.
            </p>
          ) : (
            featuredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 group relative flex flex-col"
              >
                {/* Heart Icon - Top Right of the card */}
                <button
                  onClick={(e) => toggleWishlist(product, e)}
                  className={`absolute top-3 right-3 z-30 p-2 hover:text-red-500 bg-white/80 backdrop-blur-sm rounded-full shadow-sm transition-all ${isProductInWishlist(product._id) ? "text-red-500 opacity-100 translate-y-0" : "text-gray-400 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"}`}
                  title="Yêu thích"
                >
                  <Heart
                    className={`w-5 h-5 ${isProductInWishlist(product._id) ? "fill-red-500" : ""}`}
                  />
                </button>

                <div className="relative overflow-hidden aspect-square p-4 bg-white flex items-center justify-center">
                  {product.comparePrice > product.price && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
                      -
                      {Math.round(
                        ((product.comparePrice - product.price) /
                          product.comparePrice) *
                          100,
                      )}
                      %
                    </span>
                  )}
                  <img
                    src={getImgUrl(product.thumbnail, DEFAULT_PRODUCT_IMG)}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMG;
                    }}
                  />
                </div>

                <div className="p-4 border-t border-gray-50 flex-grow flex flex-col relative">
                  <Link to={`/product/${product._id}`} className="block">
                    <h3
                      className="font-medium text-gray-900 mb-1 line-clamp-2 hover:text-primary-600 transition-colors leading-snug min-h-[44px]"
                      title={product.name}
                    >
                      {product.name}
                    </h3>
                  </Link>

                  {/* Short description */}
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2 h-[32px]">
                    {product.shortDesc ||
                      product.category?.name ||
                      "Đang cập nhật"}
                  </p>

                  {/* Stats: Rating, Views, Purchases */}
                  <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-3">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="font-medium">
                        {product.rating || 5.0}
                      </span>
                      <span className="text-gray-400">
                        ({product.reviews || 0})
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{product.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 min-w-0 truncate">
                      <ShoppingBag className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">
                        Đã bán {product.soldCount || 0}
                      </span>
                    </div>
                  </div>

                  {/* Price & Cart button */}
                  <div className="mt-auto flex items-end justify-between">
                    <div className="flex flex-col">
                      <span className="text-primary-600 font-bold text-lg leading-tight">
                        {product.price.toLocaleString("vi-VN")}₫
                      </span>
                      {product.comparePrice > product.price && (
                        <span className="text-gray-400 text-sm line-through decoration-gray-300">
                          {product.comparePrice.toLocaleString("vi-VN")}₫
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(product._id);
                      }}
                      className="bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white p-2.5 rounded-xl transition-colors self-end shadow-sm border border-primary-100"
                      title="Thêm vào giỏ hàng"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Brands */}
      <section className="max-w-[1200px] mx-auto px-4 py-8">
        <h2 className="section-title">Thương Hiệu Nổi Bật</h2>
        <div className="flex flex-wrap gap-4 justify-center md:justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          {brandLoading ? (
            [...Array(8)].map((_, i) => (
              <div
                key={i}
                className="w-24 h-12 bg-gray-100 rounded animate-pulse"
              />
            ))
          ) : brands.length === 0 ? (
            <p className="text-gray-400 text-sm w-full text-center py-4">
              Chưa có thương hiệu nào
            </p>
          ) : (
            brands.map((brand) => (
              <Link
                key={brand._id}
                to={`/products?brand=${brand.slug}`}
                className="w-28 h-14 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center grayscale hover:grayscale-0 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer overflow-hidden"
                title={brand.name}
              >
                <img
                  src={getBrandLogo(brand.logo) || DEFAULT_BRAND_IMG}
                  alt={brand.name}
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_BRAND_IMG;
                  }}
                />
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
