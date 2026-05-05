import { AlertTriangle, X, Loader2 } from 'lucide-react';

type Props = {
  title?: string;
  message?: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
  confirmLabel?: string;
};

const DeleteConfirmModal = ({
  title = 'Xác nhận xoá',
  message = 'Bạn có chắc muốn xoá mục này? Hành động này không thể hoàn tác.',
  onConfirm, onClose,
  loading = false,
  confirmLabel = 'Xoá',
}: Props) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="font-extrabold">{title}</h2>
        </div>
        <button onClick={onClose} disabled={loading} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 disabled:opacity-40">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="px-6 py-5">
        <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
      </div>
      <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
        <button onClick={onClose} disabled={loading}
          className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40">
          Huỷ
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Đang xoá...' : confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

export default DeleteConfirmModal;
