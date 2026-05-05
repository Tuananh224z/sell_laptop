import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const responseCode = searchParams.get('vnp_ResponseCode');
    if (responseCode === '00') {
      navigate('/checkout/success', { replace: true });
    } else {
      navigate('/checkout/failed', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium animate-pulse">Đang xử lý thanh toán...</p>
      </div>
    </div>
  );
};

export default PaymentReturn;
