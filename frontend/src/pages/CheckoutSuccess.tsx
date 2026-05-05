import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Home, FileText } from 'lucide-react';

const CheckoutSuccess = () => {
  const location = useLocation();
  const orderNumber = location.state?.orderNumber || 'TS-XXXXX';

  return (
    <div className="bg-gray-50 min-h-[70vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 max-w-lg w-full text-center">
        
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 text-green-500 p-4 rounded-full">
            <CheckCircle className="w-16 h-16" />
          </div>
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Đặt Hàng Thành Công!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Cảm ơn bạn đã mua sắm tại TechStore. Mã đơn hàng của bạn là <span className="font-bold text-gray-900">#{orderNumber}</span>. 
          Chúng tôi sẽ sớm liên hệ để xác nhận và giao hàng.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/profile/orders"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 py-3 px-6 rounded-xl font-medium transition-colors"
          >
            <FileText className="w-5 h-5" /> Quản lý đơn hàng
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-600 text-white hover:bg-primary-700 py-3 px-6 rounded-xl font-medium transition-colors shadow-sm"
          >
            <Home className="w-5 h-5" /> Về Trang Chủ
          </Link>
        </div>
        
      </div>
    </div>
  );
};

export default CheckoutSuccess;
