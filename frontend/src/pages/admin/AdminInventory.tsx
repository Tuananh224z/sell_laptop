import { useState, useEffect, useCallback } from "react";
import {
  Search,
  RefreshCw,
  Box,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  MoreHorizontal,
  History,
  X,
} from "lucide-react";
import api from "../../config/Axios";
import { useCategories } from "../../hooks/useCategories";
import { toast } from "react-toastify";
import { Product, HistoryItem } from "./components/inventory/types";
import InventoryStats from "./components/inventory/InventoryStats";
import HistoryModal from "./components/inventory/HistoryModal";
import ImportModal from "./components/inventory/ImportModal";

const BACKEND =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
const getImg = (url: string) =>
  url ? (url.startsWith("http") ? url : `${BACKEND}${url}`) : "";
const DEFAULT_IMG = "https://placehold.co/60x60/f3f4f6/9ca3af?text=Laptop";

const AdminInventory = () => {
  const { categories } = useCategories();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Modals
  const [showHistory, setShowHistory] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [stockStatus, setStockStatus] = useState<"all" | "low" | "out">("all");

  const LIMIT = 10;

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: LIMIT };
      if (search) params.search = search;
      if (catFilter) params.category = catFilter;
      const { data } = await api.get("/products", { params });
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, catFilter]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await api.get("/inventory/history");
      setHistory(data.history);
    } catch (err) {
      toast.error("Không thể tải lịch sử");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    if (showHistory) fetchHistory();
  }, [showHistory]);

  const getStockBadge = (count: number) => {
    if (count === 0)
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
          <XCircle className="w-3 h-3" /> Hết hàng
        </span>
      );
    if (count < 5)
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
          <AlertTriangle className="w-3 h-3" /> Sắp hết
        </span>
      );
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
        <CheckCircle2 className="w-3 h-3" /> Còn hàng
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
            <Box className="w-8 h-8 text-primary-600" />
            Quản lý kho hàng
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Theo dõi tồn kho và quản lý số Serial từng máy laptop.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2.5 rounded-xl transition-all text-sm shadow-sm"
          >
            <History className="w-4 h-4" /> Lịch sử nhập/xuất
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-primary-200"
          >
            <Plus className="w-4 h-4" /> Nhập kho mới
          </button>
        </div>
      </div>

      <InventoryStats
        total={total}
        lowStockCount={products.filter((p) => p.stock > 0 && p.stock < 5).length}
        outOfStockCount={products.filter((p) => p.stock === 0).length}
      />

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, SKU..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm w-full focus:ring-1 focus:ring-primary-500 outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="border border-gray-200 rounded-xl text-sm px-3 py-2 focus:ring-1 focus:ring-primary-500 outline-none bg-white"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={stockStatus}
            onChange={(e) => setStockStatus(e.target.value as any)}
            className="border border-gray-200 rounded-xl text-sm px-3 py-2 focus:ring-1 focus:ring-primary-500 outline-none bg-white"
          >
            <option value="all">Tất cả tồn kho</option>
            <option value="low">Sắp hết hàng</option>
            <option value="out">Hết hàng</option>
          </select>

          <button
            onClick={fetchInventory}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 text-left">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Mã SKU
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  Tồn kho hiện tại
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-200 rounded" />
                        <div className="h-3 w-20 bg-gray-100 rounded" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-20 bg-gray-200 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-8 bg-gray-200 rounded mx-auto" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-20 bg-gray-200 rounded-full mx-auto" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-8 w-8 bg-gray-200 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Không tìm thấy sản phẩm nào trong kho.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImg(product.thumbnail) || DEFAULT_IMG}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-100"
                          alt={product.name}
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate max-w-[250px]">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {product.category?.name || "Chưa phân loại"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {product.sku}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`text-lg font-bold ${product.stock === 0 ? "text-red-600" : product.stock < 5 ? "text-amber-600" : "text-gray-900"}`}
                        >
                          {product.stock}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium uppercase">
                          Máy
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {getStockBadge(product.stock)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500 font-medium">
            Hiển thị{" "}
            <span className="text-gray-900">
              {(page - 1) * LIMIT + 1} - {Math.min(page * LIMIT, total)}
            </span>{" "}
            trong <span className="text-gray-900">{total}</span> sản phẩm
          </p>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>
            {[...Array(pages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-lg border text-sm font-bold transition-all ${
                  page === i + 1
                    ? "bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-100"
                    : "border-gray-200 hover:bg-white text-gray-600"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={page === pages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      {showHistory && (
        <HistoryModal
          onClose={() => setShowHistory(false)}
          history={history}
          loading={historyLoading}
        />
      )}

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onSuccess={() => {
            setShowImport(false);
            fetchInventory();
          }}
          products={products}
        />
      )}

      {/* Warning Box */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-bold">Lưu ý về quy trình nhập kho:</p>
          <p className="mt-1">
            Hệ thống quản lý tồn kho dựa trên danh sách số Serial thực tế. Khi
            nhập thêm hàng, hãy đảm bảo bạn đã cập nhật đầy đủ mã Serial cho
            từng máy để hệ thống tính toán chính xác số lượng tồn kho hiển thị
            cho khách hàng.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;
