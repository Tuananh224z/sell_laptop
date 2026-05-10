import { useState, useEffect } from 'react';
import { X, Building2, Hash, User2, Copy, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../config/Axios';

interface PaymentQRModalProps {
  orderNumber: string;
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentQRModal = ({ orderNumber, amount, onClose, onSuccess }: PaymentQRModalProps) => {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [status, setStatus] = useState<'pending' | 'success'>('pending');

  const bankId = import.meta.env.VITE_BANK_ID || '970422'; // MB Bank Default
  const accountNo = import.meta.env.VITE_ACCOUNT_NO || '0342055095';
  const accountName = import.meta.env.VITE_ACCOUNT_NAME || 'CAO XUAN TUAN ANH';
  
  // Format addInfo properly without spaces or special characters if needed, but VietQR handles URL encoding.
  // We'll use orderNumber as the transfer content.
  const transferContent = orderNumber;
  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${transferContent}&accountName=${encodeURIComponent(accountName)}`;

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    // Polling order status every 3 seconds
    const interval = setInterval(async () => {
      if (status === 'success') return;
      try {
        const { data } = await api.get(`/orders/${orderNumber}`);
        if (data.paymentStatus === 'paid') {
          setStatus('success');
          clearInterval(interval);
          setTimeout(() => {
            onSuccess();
          }, 1500); // Give user 1.5s to see the success message
        }
      } catch (err) {
        // Silently ignore errors during polling
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderNumber, status, onSuccess]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}`);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => status !== 'success' && onClose()} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose} 
          disabled={status === 'success'}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors z-10 disabled:opacity-50"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Left Column: QR Code */}
          <div className="md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col items-center bg-gray-50/50">
            <h2 className="text-xl font-black text-blue-900 mb-1">Thanh toán QR</h2>
            <p className="text-gray-600 mb-1">Số tiền: <span className="text-red-600 font-bold text-lg">{amount.toLocaleString('vi-VN')}đ</span></p>
            <p className="text-gray-500 text-sm mb-4">Nội dung chuyển khoản: <strong className="text-gray-900">{transferContent}</strong></p>
            
            <div className="flex items-center justify-center gap-2 mb-4 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full font-medium text-sm w-fit">
              {status === 'success' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-green-700 font-bold">Thanh toán thành công!</span>
                </>
              ) : (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang chờ thanh toán...</span>
                </>
              )}
            </div>

            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 mb-4 relative group">
              <div className={`transition-opacity duration-300 ${status === 'success' ? 'opacity-50 blur-sm' : ''}`}>
                <img src={qrUrl} alt="VietQR" className="w-48 h-48 md:w-56 md:h-56 object-contain" />
              </div>
              {status === 'success' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg border border-green-100 flex flex-col items-center">
                    <CheckCircle2 className="w-10 h-10 text-green-500 mb-2" />
                    <p className="font-bold text-green-700 text-base">Hoàn tất</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-orange-50 border border-orange-100 px-6 py-2.5 rounded-2xl text-center w-full max-w-[280px]">
              <p className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-0.5">Mã QR hết hạn sau:</p>
              <p className="text-xl font-black text-orange-600 font-mono tracking-tight">{formatTime(timeLeft)}</p>
            </div>
          </div>

          {/* Right Column: Information */}
          <div className="md:w-1/2 p-6 bg-white flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-5 border-b border-gray-100 pb-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Thông tin chuyển khoản</h3>
            </div>

            <div className="space-y-3 mb-5">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-blue-600 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Ngân hàng</p>
                  <p className="font-bold text-gray-900 text-base">MB Bank</p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-green-600 shrink-0">
                    <Hash className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Số tài khoản</p>
                    <p className="font-bold text-blue-700 text-lg tracking-wider">{accountNo}</p>
                  </div>
                </div>
                <button 
                  onClick={() => copyToClipboard(accountNo, "Số tài khoản")}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-purple-600 shrink-0">
                  <User2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Chủ tài khoản</p>
                  <p className="font-bold text-gray-900 text-base">{accountName}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-5">
              <h4 className="font-bold text-blue-900 text-sm mb-3 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                Hướng dẫn thanh toán
              </h4>
              <ul className="space-y-2.5">
                {[
                  "Mở ứng dụng ngân hàng hoặc ví điện tử",
                  "Quét mã QR hoặc nhập thông tin thủ công",
                  "Kiểm tra kỹ nội dung và số tiền",
                  "Xác nhận và hoàn tất giao dịch"
                ].map((step, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {idx + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-yellow-800 font-medium leading-relaxed italic">
                Lưu ý: Giữ lại biên lai đến khi đơn hàng hoàn tất. Không đóng cửa sổ khi hệ thống đang kiểm tra.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentQRModal;
