import { Link } from 'react-router-dom';
import { XCircle, RefreshCcw, Home } from 'lucide-react';

const CheckoutFailed = () => {
  return (
    <div className="bg-gray-50 min-h-[70vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 max-w-lg w-full text-center">
        
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 text-red-500 p-4 rounded-full">
            <XCircle className="w-16 h-16" />
          </div>
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Thanh toán thất bại!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Rất tiếc, đã có lỗi xảy ra trong quá trình xử lý thanh toán của bạn. Vui lòng kiểm tra lại thông tin thẻ hoặc chọn hình thức thanh toán khác.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/checkout"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-600 text-white hover:bg-primary-700 py-3 px-6 rounded-xl font-medium transition-colors shadow-sm"
          >
            <RefreshCcw className="w-5 h-5" /> Thử lại
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 py-3 px-6 rounded-xl font-medium transition-colors"
          >
            <Home className="w-5 h-5" /> Về Trang Chủ
          </Link>
        </div>
        
      </div>
    </div>
  );
};

export default CheckoutFailed;
