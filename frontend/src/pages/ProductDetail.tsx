import { useState, useRef, useEffect } from "react";
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  ChevronLeft,
  ChevronRight,
  Shield,
  Truck,
  ArrowLeftRight,
  Check,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  PackageCheck,
  XCircle,
  CheckCircle2,
  Sparkles,
  MessageSquarePlus,
  Package,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { productService } from "../services/productService";
import { reviewService } from "../services/reviewService";
import { settingService } from "../services/settingService";
import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";

const BACKEND =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
const getImgUrl = (
  src: string,
  fallback: string = "https://placehold.co/600x450/f3f4f6/9ca3af?text=Product",
) => {
  if (!src) return fallback;
  if (/^https?:\/\//.test(src)) return src;
  const path = src.startsWith("/") ? src : `/${src}`;
  return `${BACKEND}${path}`;
};

// ─── Sub-components ─────────────────────────────────────────────────────────
const StarRating = ({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "lg";
}) => {
  const cls = size === "lg" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${cls} ${s <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
};

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  comparePrice?: number;
  oldPrice?: number;
  tierDiscount?: number;
  shortDesc?: string;
  description: string;
  thumbnail: string;
  images: string[];
  brand?: { _id: string; name: string; slug?: string };
  category?: { _id: string; name: string; slug?: string };
  stock: number;
  rating: number;
  numReviews: number;
  reviewCount?: number;
  reviews?: number;
  views?: number;
  purchases?: number;
  soldCount?: number;
  hasVariants?: boolean;
  specGroups?: Array<{
    name: string;
    specs: Array<{ key: string; value: string }>;
  }>;
  variants?: Array<{
    _id: string;
    name: string;
    price: number;
    stock: number;
  }>;
}

// ─── Main Component ──────────────────────────────────────────────────────────
const ProductDetail = () => {
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [isDescLong, setIsDescLong] = useState(false);
  const descRef = useRef<HTMLDivElement>(null);
  const [openSpecGroups, setOpenSpecGroups] = useState<string[]>([]);

  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeVariant, setActiveVariant] =
    useState<Product["variants"] extends Array<infer V> ? V : any>(null);
  const { user, setUser } = useAuth();
  const { addToCart, loading: cartLoading } = useCart();
  const [settings, setSettings] = useState<any>(null);

  const [realReviews, setRealReviews] = useState<any[]>([]);
  const [canReview, setCanReview] = useState({ canReview: false, reason: "" });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  const fetchReviews = async () => {
    if (!id) return;
    try {
      const { data } = await reviewService.getProductReviews(id);
      setRealReviews(data);
    } catch (err) {
      console.error("Fetch reviews failed", err);
    }
  };

  const checkReviewEligibility = async () => {
    if (!id || !user) return;
    try {
      const { data } = await reviewService.checkEligibility(id);
      setCanReview(data);
    } catch (err) {
      console.error("Check review failed", err);
    }
  };

  useEffect(() => {
    settingService.getSettings()
      .then((res) => setSettings(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;

    // Fetch product details
    productService.getOne(id)
      .then((res) => {
        const data = res.data;
        setProduct(data);
        if (data.specGroups?.length > 0) {
          setOpenSpecGroups(
            data.specGroups.map((g: any) => g.name).slice(0, 3),
          );
        }
        if ((data.variants?.length ?? 0) > 0)
          setActiveVariant(data.variants![0]);

        // Fetch related products (same category)
        if (data.category?._id || data.category) {
          const catId = data.category._id || data.category;
          productService.getAll({ category: catId, limit: 6 })
            .then((r) => {
              setRelatedProducts(
                (r.data.products || [])
                   .filter((p: any) => p._id !== data._id)
                   .slice(0, 5),
              );
            })
            .catch((err: any) =>
              console.error("Fetch related products failed", err),
            );
        }

        // Increment view count if not already viewed in this session
        const viewedProducts = JSON.parse(
          sessionStorage.getItem("viewed_products") || "[]",
        );
        if (!viewedProducts.includes(data._id)) {
          productService.incrementView(data._id).catch(() => {});
          viewedProducts.push(data._id);
          sessionStorage.setItem(
            "viewed_products",
            JSON.stringify(viewedProducts),
          );
        }
      })
      .catch((err: any) => console.error(err))
      .finally(() => setLoading(false));

    fetchReviews();
    if (user) checkReviewEligibility();
  }, [id, user]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newComment.trim()) return;

    setSubmittingReview(true);
    try {
      await reviewService.createReview(id, {
        rating: newRating,
        comment: newComment,
      });
      toast.success("Cảm ơn bạn đã đánh giá sản phẩm!");
      setNewComment("");
      setShowReviewForm(false);
      fetchReviews();
      checkReviewEligibility();

      // Refresh product to update rating/numReviews
      const { data } = await productService.getOne(id);
      setProduct(data);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá",
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const isProductInWishlist = (productId: string) => {
    return user?.wishlist?.some((w: any) => (w._id || w) === productId);
  };

  useEffect(() => {
    if (user && product?._id) {
      setWishlist(Boolean(isProductInWishlist(product._id)));
    } else {
      setWishlist(false);
    }
  }, [user, product]);

  const toggleWishlistApi = async () => {
    if (!user || !product) {
      if (!user)
        toast.warning(
          "Vui lòng đăng nhập để lưu sản phẩm vào danh sách yêu thích!",
        );
      return;
    }
    try {
      const res = await authService.toggleWishlist(product._id);
      const newWishlist = res.data.wishlist;
      setUser({ ...user, wishlist: newWishlist });
      const isFav = newWishlist.some((w: any) => (w._id || w) === product._id);
      setWishlist(isFav);
      if (isFav) {
        toast.success("Đã thêm vào danh sách yêu thích");
      } else {
        toast.info("Đã xóa khỏi danh sách yêu thích");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Có lỗi xảy ra khi cập nhật danh sách yêu thích!");
    }
  };

  useEffect(() => {
    if (descRef.current) {
      setIsDescLong(descRef.current.scrollHeight > 160);
    }
  }, [product?.description]);

  const toggleSpecGroup = (group: string) =>
    setOpenSpecGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group],
    );

  if (loading)
    return (
      <div className="text-center py-20 font-medium">Đang tải sản phẩm...</div>
    );
  if (!product)
    return (
      <div className="text-center py-20 text-gray-500 font-medium">
        Không tìm thấy sản phẩm
      </div>
    );

  const basePrice = activeVariant
    ? activeVariant.price || product.price
    : product.price;
  const comparePrice = activeVariant
    ? activeVariant.comparePrice || product.comparePrice
    : product.comparePrice;
  const discount =
    comparePrice > basePrice
      ? Math.round(((comparePrice - basePrice) / comparePrice) * 100)
      : 0;

  const displayImages =
    product.images?.length > 0
      ? product.images
      : ["https://placehold.co/600x450/f3f4f6/9ca3af?text=Product"];

  const prevImg = () =>
    setActiveImg((i) => (i - 1 + displayImages.length) % displayImages.length);
  const nextImg = () => setActiveImg((i) => (i + 1) % displayImages.length);

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="max-w-[1200px] mx-auto px-4 pt-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 flex items-center gap-1 mb-4 flex-wrap">
          <Link to="/" className="hover:text-primary-600">
            Trang chủ
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                to={`/products?category=${typeof product.category === "object" ? product.category.slug : product.category}`}
                className="hover:text-primary-600"
              >
                {typeof product.category === "object"
                  ? product.category.name
                  : product.category}
              </Link>
            </>
          )}
          {product.brand && (
            <>
              <span>/</span>
              <Link
                to={`/products?brand=${typeof product.brand === "object" ? product.brand.slug : product.brand}`}
                className="hover:text-primary-600"
              >
                {typeof product.brand === "object"
                  ? product.brand.name
                  : product.brand}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-800 font-medium line-clamp-1">
            {product.name}
          </span>
        </nav>

        {/* ── Main Product Area ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
          {/* Left: Image Gallery */}
          <div className="lg:w-5/12">
            <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-[4/3] mb-3 group">
              <img
                src={getImgUrl(displayImages[activeImg])}
                alt={product.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/600x450/f3f4f6/9ca3af?text=Product";
                }}
              />
              <button
                onClick={prevImg}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImg}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              {discount > 0 && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                  -{discount}%
                </span>
              )}
            </div>
            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {displayImages.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-12 rounded-lg border-2 overflow-hidden shrink-0 transition-all ${i === activeImg ? "border-primary-500" : "border-gray-200 hover:border-gray-400"}`}
                >
                  <img
                    src={getImgUrl(
                      img,
                      "https://placehold.co/100x100/f3f4f6/9ca3af?text=Thumb",
                    )}
                    alt=""
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/100x100/f3f4f6/9ca3af?text=Thumb";
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="lg:w-7/12 flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <span className="bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded">
                  {typeof product.brand === "object"
                    ? product.brand?.name
                    : product.brand}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <StarRating rating={product.rating || 5} />
                  <span className="text-sm font-semibold text-gray-700">
                    {product.rating || 5}
                  </span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-500">
                  {product.reviewCount || 0} đánh giá
                </span>
                <span className="text-gray-300">|</span>
                <span
                  className={`text-sm font-medium flex items-center gap-1 ${product.stock > 0 || (product.variants?.length ?? 0) > 0 ? "text-green-600" : "text-red-500"}`}
                >
                  {product.stock > 0 || (product.variants?.length ?? 0) > 0 ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Còn hàng
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" /> Hết hàng
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-3xl font-extrabold text-primary-600">
                  {basePrice.toLocaleString("vi-VN")}₫
                </span>
                {comparePrice > basePrice && (
                  <span className="text-gray-400 text-lg line-through">
                    {comparePrice.toLocaleString("vi-VN")}₫
                  </span>
                )}
              </div>
              {comparePrice > basePrice && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-lg border border-red-100">
                    Tiết kiệm{" "}
                    {(comparePrice - basePrice).toLocaleString("vi-VN")}₫
                  </span>
                </div>
              )}
            </div>

            {/* Short Description */}
            <p className="text-sm text-gray-600 leading-relaxed border-l-4 border-primary-200 pl-4 bg-primary-50 py-2 rounded-r-lg">
              {product.shortDesc}
            </p>

            {/* ── ATTRIBUTES ─────────────────────────────────────────────── */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  Phiên bản:
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.variants.map((v: any, i: number) => (
                    <button
                      key={v._id || i}
                      onClick={() => setActiveVariant(v)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all
                        ${activeVariant?._id === v._id ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-700 hover:border-gray-400"}`}
                    >
                      {v.name || v.label}
                      {v.price > product.price && (
                        <span className="ml-1.5 text-xs font-bold text-orange-500">
                          +{(v.price - product.price).toLocaleString("vi-VN")}₫
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold text-gray-900">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="w-10 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-col w-full sm:flex-1">
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      addToCart(product._id, activeVariant?._id, qty)
                    }
                    disabled={cartLoading}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold py-3 px-6 rounded-xl shadow flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    <ShoppingCart className="w-5 h-5" /> Thêm vào giỏ
                  </button>
                  <button
                    onClick={toggleWishlistApi}
                    className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${wishlist ? "border-red-400 bg-red-50 text-red-500" : "border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400"}`}
                  >
                    <Heart
                      className={`w-5 h-5 ${wishlist ? "fill-red-500" : ""}`}
                    />
                  </button>
                  <button className="w-12 h-12 rounded-xl border-2 border-gray-200 text-gray-400 hover:border-gray-400 flex items-center justify-center transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow text-sm transition-colors flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Mua ngay — Giao hàng nhanh
            </button>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-gray-600">
              {[
                { icon: Truck, text: "Miễn phí giao toàn quốc" },
                { icon: Shield, text: "Bảo hành chính hãng" },
                { icon: ArrowLeftRight, text: "Đổi trả 30 ngày" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2 bg-gray-50 rounded-xl p-2.5 border border-gray-100"
                >
                  <Icon className="w-5 h-5 text-primary-600 shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* ── Left Column ──────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Description */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Mô tả sản phẩm
              </h2>
              <div
                ref={descRef}
                className={`prose prose-sm max-w-none text-gray-600 leading-relaxed overflow-hidden transition-all ${showFullDesc ? "" : "max-h-40"}`}
              >
                {product.description ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                ) : (
                  <p>Chưa có mô tả chi tiết cho sản phẩm này.</p>
                )}
              </div>
              {isDescLong && (
                <button
                  onClick={() => setShowFullDesc((v) => !v)}
                  className="mt-3 text-sm font-medium text-primary-600 hover:underline flex items-center gap-1"
                >
                  {showFullDesc ? (
                    <>
                      <ChevronUp className="w-4 h-4" /> Thu gọn
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" /> Xem thêm
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Technical Specs — Grouped */}
            {product.specGroups && product.specGroups.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Cấu hình kỹ thuật
                </h2>
                <div className="space-y-3">
                  {(product.specGroups || []).map(
                    ({ name: group, items: rows }: any) => {
                      const isOpen = openSpecGroups.includes(group);
                      return (
                        <div
                          key={group}
                          className="border border-gray-100 rounded-xl overflow-hidden"
                        >
                          <button
                            onClick={() => toggleSpecGroup(group)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <span className="text-sm font-bold text-gray-800">
                              {group}
                            </span>
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                          {isOpen && rows && Array.isArray(rows) && (
                            <div>
                              {rows.map((row: any, i: number) => (
                                <div
                                  key={row.key || i}
                                  className={`grid grid-cols-5 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                                >
                                  <div className="col-span-2 px-4 py-2.5 text-sm font-medium text-gray-600 border-r border-gray-100">
                                    {row.key}
                                  </div>
                                  <div className="col-span-3 px-4 py-2.5 text-sm text-gray-900">
                                    {row.value}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
                <button
                  onClick={() =>
                    openSpecGroups.length === (product.specGroups || []).length
                      ? setOpenSpecGroups([])
                      : setOpenSpecGroups(
                          (product.specGroups || []).map((s: any) => s.name),
                        )
                  }
                  className="mt-4 text-sm font-medium text-primary-600 hover:underline flex items-center gap-1"
                >
                  {openSpecGroups.length ===
                  (product.specGroups || []).length ? (
                    <>
                      <ChevronUp className="w-4 h-4" /> Thu gọn tất cả
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" /> Mở rộng tất cả (
                      {(product.specGroups || []).length} nhóm)
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Reviews */}
            <div
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              id="reviews"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Đánh giá sản phẩm
              </h2>

              {/* Summary */}
              <div className="flex flex-col md:flex-row md:items-center gap-8 mb-8 pb-8 border-b border-gray-100">
                <div className="text-center shrink-0">
                  <p className="text-5xl font-extrabold text-gray-900">
                    {product.rating || 0}
                  </p>
                  <StarRating rating={product.rating || 0} size="lg" />
                  <p className="text-xs text-gray-500 mt-1">
                    {product.numReviews || 0} đánh giá
                  </p>
                </div>
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = realReviews.filter(
                      (r) => Math.round(r.rating) === star,
                    ).length;
                    const percent = product.numReviews
                      ? (count / product.numReviews) * 100
                      : 0;
                    return (
                      <div
                        key={star}
                        className="flex items-center gap-3 text-xs"
                      >
                        <span className="w-3 text-right font-medium">
                          {star}
                        </span>
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 bg-yellow-400 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-8 text-gray-400">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review Form CTA / Form */}
              {canReview.canReview ? (
                <div className="mb-10 bg-primary-50 rounded-2xl p-6 border border-primary-100">
                  {!showReviewForm ? (
                    <div className="text-center">
                      <h3 className="font-bold text-primary-900 mb-1">
                        Bạn đã trải nghiệm sản phẩm này?
                      </h3>
                      <p className="text-sm text-primary-700 mb-4">
                        Chia sẻ cảm nghĩ của bạn để giúp những người mua khác
                        nhé!
                      </p>
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-sm inline-flex items-center gap-2"
                      >
                        <MessageSquarePlus className="w-5 h-5" /> Viết đánh giá
                        ngay
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900">
                          Viết đánh giá của bạn
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="text-xs text-gray-500 hover:underline"
                        >
                          Hủy bỏ
                        </button>
                      </div>

                      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100">
                        <span className="text-sm font-medium text-gray-700">
                          Đánh giá của bạn:
                        </span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setNewRating(s)}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-6 h-6 ${s <= newRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Máy cực mạnh, màn hình đẹp, giao hàng nhanh..."
                        required
                        className="w-full bg-white border border-gray-100 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[120px] outline-none transition-all"
                      />

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
                        >
                          {submittingReview ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : null}
                          Gửi đánh giá
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : user && canReview.reason === "Chưa mua hàng" ? (
                <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                  <p className="text-sm text-gray-500">
                    Bạn cần mua sản phẩm này để có thể gửi đánh giá.
                  </p>
                </div>
              ) : null}

              {/* Review List */}
              <div className="space-y-8">
                {realReviews.length > 0 ? (
                  realReviews.map((review) => (
                    <div
                      key={review._id}
                      className="border-b border-gray-50 pb-8 last:border-0 last:pb-0 group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-100 shadow-sm">
                          {review.user?.avatar ? (
                            <img
                              src={
                                review.user.avatar.startsWith("http")
                                  ? review.user.avatar
                                  : `${BACKEND}${review.user.avatar}`
                              }
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold uppercase">
                              {review.user?.name?.charAt(0) || "U"}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-gray-900">
                              {review.user?.name || "Người dùng ẩn danh"}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString(
                                "vi-VN",
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <StarRating rating={review.rating} />
                            <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-green-100">
                              <PackageCheck className="w-3 h-3" /> Đã mua hàng
                            </span>
                          </div>

                          <p className="text-sm text-gray-700 leading-relaxed bg-gray-50/50 p-3 rounded-xl border border-gray-50 group-hover:bg-gray-50 transition-colors">
                            {review.comment}
                          </p>

                          {review.reply?.content && (
                            <div className="mt-4 ml-6 bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3 relative before:absolute before:left-[-12px] before:top-4 before:w-3 before:h-3 before:bg-blue-50 before:border-l before:border-t before:border-blue-100 before:rotate-[-45deg]">
                              <Sparkles className="w-5 h-5 text-blue-500 shrink-0" />
                              <div>
                                <p className="text-xs font-bold text-blue-700 mb-1">
                                  Phản hồi từ TechStore ·{" "}
                                  {new Date(
                                    review.reply.repliedAt,
                                  ).toLocaleDateString("vi-VN")}
                                </p>
                                <p className="text-sm text-gray-700 italic">
                                  "{review.reply.content}"
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-gray-400">
                    <MessageSquarePlus className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">
                      Chưa có đánh giá nào cho sản phẩm này.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right Column ──────────────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Delivery Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
              <h3 className="font-bold text-gray-900 text-sm mb-3">
                Thông tin giao hàng
              </h3>
              {[
                {
                  icon: Truck,
                  title: "Giao nhanh trong 2 giờ",
                  sub: "Nội thành TP. Hồ Chí Minh & Hà Nội",
                },
                {
                  icon: Shield,
                  title: "Bảo hành tại 200+ trung tâm",
                  sub: "Trên toàn quốc",
                },
                {
                  icon: ArrowLeftRight,
                  title: "Đổi trả trong 30 ngày",
                  sub: "1-1 nếu lỗi do nhà sản xuất",
                },
                {
                  icon: Check,
                  title: "Hàng chính hãng 100%",
                  sub: "Nhập khẩu và phân phối chính thức",
                },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{title}</p>
                    <p className="text-xs text-gray-500">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Image Upload Notice */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start gap-3">
                <ImageIcon className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Xem thực tế sản phẩm
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Ghé trực tiếp cửa hàng hoặc liên hệ hotline để được tư vấn
                    và xem hàng thực tế.
                  </p>
                  <a
                    href={`tel:${settings?.phone || "0123456789"}`}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline"
                  >
                    {settings?.phone || "0123 456 789"}
                  </a>
                </div>
              </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-4 text-sm flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary-600" />
                  Sản phẩm liên quan
                </h3>
                <div className="space-y-4">
                  {relatedProducts.map((rp) => (
                    <Link
                      key={rp._id}
                      to={`/product/${rp._id}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-100 shrink-0 bg-gray-50 p-1">
                        <img
                          src={getImgUrl(rp.thumbnail)}
                          alt={rp.name}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-800 font-medium line-clamp-2 group-hover:text-primary-600 transition-colors leading-snug">
                          {rp.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm font-bold text-primary-600">
                            {rp.price.toLocaleString("vi-VN")}₫
                          </p>
                          {rp.comparePrice > rp.price && (
                            <p className="text-[10px] text-gray-400 line-through">
                              {rp.comparePrice.toLocaleString("vi-VN")}₫
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  to={`/products?category=${product.category?.slug || product.category}`}
                  className="mt-4 block text-center text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline pt-4 border-t border-gray-50"
                >
                  Xem thêm sản phẩm cùng loại
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
