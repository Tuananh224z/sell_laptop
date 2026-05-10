import { useState } from "react";
import { Tag, Calendar, ToggleLeft, ToggleRight, Sparkles, X } from "lucide-react";
import api from "../../../../config/Axios";
import { toast } from "react-toastify";
import { Promo } from "./types";

const PromoModal = ({
  promo,
  onClose,
  onSave,
}: {
  promo: Partial<Promo> | null;
  onClose: () => void;
  onSave: () => void;
}) => {
  const isNew = !promo?._id;
  const [form, setForm] = useState({
    code: promo?.code ?? "",
    name: promo?.name ?? "",
    type: promo?.type ?? "percentage",
    value: promo?.value ?? 0,
    minOrderValue: promo?.minOrderValue ?? 0,
    maxDiscount: promo?.maxDiscount ?? 0,
    usageLimit: promo?.usageLimit ?? 0,
    startDate: promo?.startDate
      ? new Date(promo.startDate).toISOString().split("T")[0]
      : "",
    endDate: promo?.endDate
      ? new Date(promo.endDate).toISOString().split("T")[0]
      : "",
    isActive: promo?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.code || !form.name || !form.startDate || !form.endDate) {
      return toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
    }
    setLoading(true);
    try {
      if (isNew) {
        await api.post("/coupons", form);
        toast.success("Thêm mã giảm giá thành công");
      } else {
        await api.patch(`/coupons/${promo?._id}`, form);
        toast.success("Cập nhật mã giảm giá thành công");
      }
      onSave();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-gray-900">
              {isNew ? "Thêm khuyến mại" : "Chỉnh sửa khuyến mại"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                Mã giảm giá *
              </label>
              <input
                value={form.code}
                onChange={(e) => set("code", e.target.value.toUpperCase())}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold tracking-widest focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none uppercase transition-all bg-gray-50/50"
                placeholder="VD: SALE50"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                Loại hình
              </label>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
              >
                <option value="percentage">% Giảm giá</option>
                <option value="fixed">Giảm tiền cố định</option>
                <option value="shipping">Miễn phí ship</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
              Tên chương trình *
            </label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
              placeholder="VD: Khuyến mại hè 2026"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                {form.type === "percentage"
                  ? "Phần trăm giảm (%)"
                  : "Số tiền giảm (₫)"}
              </label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => set("value", Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold text-primary-600"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                Đơn tối thiểu (₫)
              </label>
              <input
                type="number"
                value={form.minOrderValue}
                onChange={(e) => set("minOrderValue", Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
              />
            </div>
          </div>

          {form.type === "percentage" && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                Giảm tối đa (₫) (0 = không giới hạn)
              </label>
              <input
                type="number"
                value={form.maxDiscount}
                onChange={(e) => set("maxDiscount", Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
              Tổng số lượt dùng (0 = không giới hạn)
            </label>
            <input
              type="number"
              value={form.usageLimit}
              onChange={(e) => set("usageLimit", Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                Ngày bắt đầu
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => set("startDate", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                Ngày kết thúc
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => set("endDate", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${form.isActive ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-500"}`}
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {form.isActive ? "Đang kích hoạt" : "Đang tạm dừng"}
                </p>
                <p className="text-xs text-gray-500">
                  Người dùng {form.isActive ? "có thể" : "không thể"} sử dụng mã
                  này
                </p>
              </div>
            </div>
            <button
              onClick={() => set("isActive", !form.isActive)}
              type="button"
            >
              {form.isActive ? (
                <ToggleRight className="w-10 h-10 text-primary-600" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-gray-300" />
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white/80 backdrop-blur-md">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-semibold transition-all shadow-md shadow-primary-100"
          >
            {loading ? "Đang lưu..." : "Lưu thông tin"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoModal;
