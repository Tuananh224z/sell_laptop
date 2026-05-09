import { useState, useEffect } from "react";
import { Search, Eye, X, MapPin, Phone, Package, Mail } from "lucide-react";
import api from "../../config/Axios";
import { toast } from "react-toastify";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-700" },
  processing: { label: "Đang xử lý", color: "bg-orange-100 text-orange-700" },
  shipping: { label: "Đang giao", color: "bg-blue-100 text-blue-700" },
  delivered: { label: "Đã giao", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-700" },
};

interface Order {
  _id: string;
  orderNumber: string;
  user: { name: string; email: string; phone: string };
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    ward: string;
    district: string;
    city: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    variantLabel?: string;
  }>;
  paymentMethod: string;
  orderStatus: string;
  total: number;
  createdAt: string;
  note?: string;
}

const OrderDetailModal = ({
  order,
  onClose,
  onUpdate,
}: {
  order: Order;
  onClose: () => void;
  onUpdate: (id: string, s: string) => void;
}) => {
  const [status, setStatus] = useState(order.orderStatus);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch(`/orders/admin/${order._id}/status`, { status });
      toast.success("Cập nhật trạng thái thành công");
      onUpdate(order._id, status);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Cập nhật thất bại");
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-extrabold text-gray-900 text-lg">
              #{order.orderNumber}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date(order.createdAt).toLocaleString("vi-VN")} ·{" "}
              {order.paymentMethod.toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
              Khách hàng
            </p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="font-semibold text-gray-900">
                {order.shippingAddress.name}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                {order.shippingAddress.phone}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {order.user?.email}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-1.5 leading-relaxed">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {order.shippingAddress.address}, {order.shippingAddress.ward},{" "}
                {order.shippingAddress.district}, {order.shippingAddress.city}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
              Sản phẩm
            </p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="bg-gray-50 rounded-xl p-3 flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      SL: {item.quantity}{" "}
                      {item.variantLabel ? `· ${item.variantLabel}` : ""}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 shrink-0">
                    {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                  </p>
                </div>
              ))}
              <div className="flex justify-between items-center px-2 pt-1">
                <span className="text-sm font-bold text-gray-900">
                  Tổng tiền:
                </span>
                <span className="text-lg font-black text-primary-600">
                  {order.total.toLocaleString("vi-VN")}₫
                </span>
              </div>
            </div>
          </div>

          {order.note && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                Ghi chú
              </p>
              <p className="text-sm text-gray-600 bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3">
                {order.note}
              </p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
              Cập nhật trạng thái
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(STATUS_MAP).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setStatus(key)}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-all ${status === key ? "bg-primary-600 text-white border-primary-600 shadow-sm" : "border-gray-200 text-gray-700 hover:border-gray-400 bg-white"}`}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-white bg-white transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handleSave}
            disabled={loading || status === order.orderStatus}
            className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-semibold transition-all shadow-md shadow-primary-200"
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Order | null>(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders/admin/all");
      setOrders(data);
    } catch (err) {
      console.error("Fetch orders failed", err);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdate = (id: string, status: string) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === id ? { ...o, orderStatus: status } : o)),
    );
  };

  const filtered = orders
    .filter((o) => statusFilter === "all" || o.orderStatus === statusFilter)
    .filter(
      (o) =>
        o.shippingAddress.name.toLowerCase().includes(search.toLowerCase()) ||
        o.orderNumber.toLowerCase().includes(search.toLowerCase()),
    )
    .filter((o) => {
      if (!startDate && !endDate) return true;
      const orderDate = new Date(o.createdAt).setHours(0, 0, 0, 0);
      if (startDate) {
        const start = new Date(startDate).setHours(0, 0, 0, 0);
        if (orderDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate).setHours(23, 59, 59, 999);
        if (orderDate > end) return false;
      }
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Quản lý đơn hàng
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading
              ? "Đang tải..."
              : `${filtered.length} đơn hàng được tìm thấy`}
          </p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${statusFilter === "all" ? "bg-primary-600 text-white shadow-md shadow-primary-200" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"}`}
        >
          Tất cả
        </button>
        {Object.entries(STATUS_MAP).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${statusFilter === key ? "bg-primary-600 text-white shadow-md shadow-primary-200" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"}`}
          >
            {val.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-4 flex-wrap bg-gray-50/30">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm mã đơn, tên khách hàng..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm w-full focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-gray-400 uppercase">
                Từ
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-gray-400 uppercase">
                Đến
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                title="Xóa bộ lọc ngày"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/50">
              <tr>
                {[
                  "Mã đơn",
                  "Khách hàng",
                  "Tổng tiền",
                  "Ngày đặt",
                  "Thanh toán",
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
                filtered.map((o) => (
                  <tr
                    key={o._id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    <td className="px-5 py-4 font-mono text-xs font-bold text-primary-700">
                      #{o.orderNumber}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900">
                        {o.shippingAddress.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {o.shippingAddress.phone}
                      </p>
                    </td>
                    <td className="px-5 py-4 font-black text-gray-900 whitespace-nowrap">
                      {o.total.toLocaleString("vi-VN")}₫
                    </td>
                    <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-medium text-gray-600 uppercase bg-gray-100 px-2 py-1 rounded-md">
                        {o.paymentMethod}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm ${STATUS_MAP[o.orderStatus]?.color}`}
                      >
                        {STATUS_MAP[o.orderStatus]?.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelected(o)}
                        className="p-2 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white transition-all transform group-hover:scale-110"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-gray-400"
                  >
                    Không tìm thấy đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};
export default AdminOrders;
