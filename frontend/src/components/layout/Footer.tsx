import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import api from '../../config/Axios';

const Footer = () => {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        setSettings(data);
      } catch (err) {
        console.error('Failed to fetch settings');
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">{settings?.siteName || 'TechStore'}</h3>
            <p className="mb-4">Chuyên cung cấp các sản phẩm máy tính, laptop, linh kiện chính hãng với giá tốt nhất thị trường.</p>
            <div className="space-y-3 mt-4">
              <p className="flex items-center gap-2">
                 <MapPin className="text-primary-500 w-5 h-5 flex-shrink-0" />
                 <span>{settings?.address || '123 Đường Công Nghệ, Quận 1, TP. HCM'}</span>
              </p>
              <p className="flex items-center gap-2">
                 <Phone className="text-primary-500 w-5 h-5 flex-shrink-0" />
                 <span>{settings?.phone || '0123 456 789'}</span>
              </p>
              <p className="flex items-center gap-2">
                 <Mail className="text-primary-500 w-5 h-5 flex-shrink-0" />
                 <span>{settings?.email || 'support@techstore.vn'}</span>
              </p>
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Hỗ Trợ Khách Hàng</h3>
            <ul className="space-y-2">
              <li><Link to="/buying-guide" className="hover:text-primary-500 transition-colors">Hướng dẫn mua hàng</Link></li>
              <li><Link to="/warranty-policy" className="hover:text-primary-500 transition-colors">Chính sách bảo hành</Link></li>
              <li><Link to="/return-policy" className="hover:text-primary-500 transition-colors">Chính sách đổi trả</Link></li>
              <li><Link to="/payment-methods" className="hover:text-primary-500 transition-colors">Phương thức thanh toán</Link></li>
              <li><Link to="/delivery-installation" className="hover:text-primary-500 transition-colors">Giao hàng và lắp đặt</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Danh Mục Sản Phẩm</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-primary-500 transition-colors">Laptop Mới</a></li>
              <li><a href="#" className="hover:text-primary-500 transition-colors">PC Gaming</a></li>
              <li><a href="#" className="hover:text-primary-500 transition-colors">PC Văn Phòng</a></li>
              <li><a href="#" className="hover:text-primary-500 transition-colors">Linh Kiện Máy Tính</a></li>
              <li><a href="#" className="hover:text-primary-500 transition-colors">Phụ Kiện</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Đăng Ký Nhận Tin</h3>
            <p className="mb-4">Nhận thông tin khuyến mãi mới nhất từ chúng tôi.</p>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Email của bạn" 
                className="px-4 py-2 w-full rounded-l border-none focus:outline-none text-gray-900 bg-white"
              />
              <button 
                type="button" 
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-r transition-colors"
              >
                Gửi
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} TechStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
