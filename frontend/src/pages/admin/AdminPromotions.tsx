import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import DeleteConfirmModal from "./DeleteConfirmModal";
import api from "../../config/Axios";
import { toast } from "react-toastify";
import { Promo } from "./components/promotion/types";
import PromoModal from "./components/promotion/PromoModal";

const typeLabel: Record<string, { text: string; color: string }> = {
  percentage: { text: "% Giảm giá", color: "bg-violet-100 text-violet-700" },
  fixed: { text: "Giảm tiền cố định", color: "bg-blue-100 text-blue-700" },
  shipping: { text: "Miễn phí ship", color: "bg-green-100 text-green-700" },
};

const AdminPromotions = () => {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<Partial<Promo> | null | undefined>(
    undefined,
  );
  const [deleteTarget, setDeleteTarget] = useState<Promo | null>(null);
  const [filter, setFilter] = useState("all");

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/coupons");
      setPromos(data);
    } catch (err) {
      console.error("Fetch promos failed", err);
      toast.error("Không thể tải danh sách khuyến mại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/coupons/${deleteTarget._id}`);
      toast.success("Xóa mã giảm giá thành công");
      setPromos((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể xóa");
    }
  };

  const filtered = promos
    .filter((p) =>
      filter === "all" ? true : filter === "active" ? p.isActive : !p.isActive,
    )
    .filter(
      (p) =>
        p.code.includes(search.toUpperCase()) ||
        p.name.toLowerCase().includes(search.toLowerCase()),
    );

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Quản lý khuyến mại
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading
              ? "Đang tải..."
              : `${filtered.length} mã giảm giá được tìm thấy`}
          </p>
        </div>
        <button
          onClick={() => setModal({})}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-primary-100 hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Thêm mã mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Tổng số mã",
            value: promos.length,
            color: "text-gray-900",
            bg: "bg-white",
          },
          {
            label: "Đang chạy",
            value: promos.filter((p) => p.isActive).length,
            color: "text-green-600",
            bg: "bg-green-50/50",
          },
          {
            label: "Tạm dừng",
            value: promos.filter((p) => !p.isActive).length,
            color: "text-orange-600",
            bg: "bg-orange-50/50",
          },
          {
            label: "Lượt đã dùng",
            value: promos.reduce((s, p) => s + (p.usedCount || 0), 0),
            color: "text-primary-600",
            bg: "bg-primary-50/50",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`${s.bg} rounded-2xl border border-gray-100 shadow-sm p-5 text-center transition-transform hover:-translate-y-1`}
          >
            <p className={`text-2xl font-black ${s.color}`}>
              {loading ? "..." : s.value}
            </p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-wrap bg-gray-50/30">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm mã hoặc tên chương trình..."
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm w-full focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
            />
          </div>
          <div className="flex gap-1.5 p-1 bg-white rounded-xl border border-gray-200">
            {[
              { id: "all", label: "Tất cả" },
              { id: "active", label: "Đang chạy" },
              { id: "inactive", label: "Tạm dừng" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f.id ? "bg-primary-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/50">
              <tr>
                {[
                  "Mã",
                  "Tên chương trình",
                  "Loại",
                  "Giá trị",
                  "Hiệu lực",
                  "Trạng thái",
                  "Thao tác",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-gray-400"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((p) => (
                  <tr
                    key={p._id}
                    className="hover:bg-gray-50/70 transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-100">
                        {p.code}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900">{p.name}</p>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                        Lượt dùng:{" "}
                        <span className="font-bold text-gray-600">
                          {p.usedCount || 0}/{p.usageLimit || "∞"}
                        </span>
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${typeLabel[p.type]?.color}`}
                      >
                        {typeLabel[p.type]?.text}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-black text-gray-900">
                      {p.type === "percentage"
                        ? `${p.value}%`
                        : `${p.value.toLocaleString("vi-VN")}₫`}
                    </td>
                    <td className="px-5 py-4 text-[10px] text-gray-500 leading-tight">
                      <div>
                        {new Date(p.startDate).toLocaleDateString("vi-VN")}
                      </div>
                      <div className="text-gray-300">↓</div>
                      <div>
                        {new Date(p.endDate).toLocaleDateString("vi-VN")}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                      >
                        {p.isActive ? "Đang chạy" : "Tạm dừng"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setModal(p)}
                          className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-gray-400"
                  >
                    Không có mã giảm giá nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal !== undefined && (
        <PromoModal
          promo={modal}
          onClose={() => setModal(undefined)}
          onSave={fetchPromos}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          title="Xóa mã khuyến mại"
          message={`Hành động này không thể hoàn tác. Bạn có chắc muốn xóa mã "${deleteTarget.code}"?`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default AdminPromotions;
