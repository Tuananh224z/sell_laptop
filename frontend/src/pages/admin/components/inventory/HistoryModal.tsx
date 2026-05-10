import { History, X, ArrowDownCircle, ArrowUpCircle, Calendar, User as UserIcon, Info, Loader2 } from "lucide-react";
import { HistoryItem } from "./types";

const BACKEND = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
const getImg = (url: string) => url ? (url.startsWith("http") ? url : `${BACKEND}${url}`) : "";
const DEFAULT_IMG = "https://placehold.co/60x60/f3f4f6/9ca3af?text=Laptop";

interface HistoryModalProps {
  onClose: () => void;
  history: HistoryItem[];
  loading: boolean;
}

const HistoryModal = ({ onClose, history, loading }: HistoryModalProps) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-4xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <History className="w-6 h-6 text-primary-600" />
            Lịch sử nhập/xuất kho
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-gray-600 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
              <p className="font-medium">Đang tải lịch sử...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                <History className="w-8 h-8" />
              </div>
              <p className="font-medium text-lg text-gray-500">
                Chưa có lịch sử nhập xuất nào
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={item._id}
                  className="group flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-primary-100 hover:bg-primary-50/30 transition-all"
                >
                  <img
                    src={getImg(item.product.thumbnail) || DEFAULT_IMG}
                    className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {item.type === "import" ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          <ArrowDownCircle className="w-3 h-3" /> Nhập kho
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          <ArrowUpCircle className="w-3 h-3" /> Xuất kho
                        </span>
                      )}
                      <span className="text-xs text-gray-400 font-mono">
                        {item.product.sku}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 truncate">
                      {item.product.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{" "}
                        {new Date(item.createdAt).toLocaleString("vi-VN")}
                      </span>
                      <span className="flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />{" "}
                        {item.createdBy?.name || "System"}
                      </span>
                      <span className="font-bold text-gray-700">
                        Số lượng: {item.quantity}
                      </span>
                    </div>
                    {item.note && (
                      <div className="mt-2 flex items-start gap-2 bg-white/50 p-2 rounded-lg border border-gray-50 text-[11px] text-gray-600 italic">
                        <Info className="w-3 h-3 shrink-0 mt-0.5 text-blue-400" />
                        {item.note}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 max-w-[200px] justify-end">
                    {item.serials.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="text-[10px] font-mono bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-500"
                      >
                        {s}
                      </span>
                    ))}
                    {item.serials.length > 3 && (
                      <span className="text-[10px] font-bold text-primary-600">
                        + {item.serials.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
