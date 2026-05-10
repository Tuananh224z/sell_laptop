import { ArrowDownCircle, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { Product } from "./types";
import api from "../../../../config/Axios";
import { toast } from "react-toastify";

interface ImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
  products: Product[];
}

const ImportModal = ({ onClose, onSuccess, products }: ImportModalProps) => {
  const [importProduct, setImportProduct] = useState("");
  const [importSerials, setImportSerials] = useState("");
  const [importNote, setImportNote] = useState("");
  const [importLoading, setImportLoading] = useState(false);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importProduct || !importSerials)
      return toast.warning("Vui lòng chọn sản phẩm và nhập Serial");

    setImportLoading(true);
    try {
      const serialList = importSerials
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      await api.post("/inventory/import", {
        productId: importProduct,
        serials: serialList,
        note: importNote,
      });
      toast.success("Nhập kho thành công!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi nhập kho");
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-primary-600 text-white">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <ArrowDownCircle className="w-6 h-6" />
            Nhập hàng vào kho
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-700 rounded-xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleImport} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Sản phẩm cần nhập
            </label>
            <select
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              value={importProduct}
              onChange={(e) => setImportProduct(e.target.value)}
            >
              <option value="">Chọn sản phẩm...</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Danh sách số Serial (mỗi dòng 1 mã)
            </label>
            <textarea
              rows={6}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              placeholder="ABC12345&#10;XYZ67890..."
              value={importSerials}
              onChange={(e) => setImportSerials(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Ghi chú (Tùy chọn)
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Nhập hàng từ nhà cung cấp A..."
              value={importNote}
              onChange={(e) => setImportNote(e.target.value)}
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={importLoading}
              className="flex-1 py-3 px-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
            >
              {importLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Xác nhận nhập kho"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportModal;
