import { useState, useEffect } from 'react';
import { Bell, Clock, ChevronRight, Loader2, Info } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'react-toastify';

interface Notification {
  _id: string;
  title: string;
  content: string;
  sentAt: string;
  createdAt: string;
}

const ProfileNotifications = () => {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const { data } = await api.get('/notifications/my');
      setNotifs(data);
    } catch (err) {
      toast.error('Lỗi tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Thông báo của tôi</h2>
          <p className="text-sm text-gray-500 mt-1">Cập nhật những tin tức và ưu đãi mới nhất từ TechStore</p>
        </div>
        <div className="bg-primary-50 text-primary-600 px-3 py-1 rounded-full text-xs font-bold">
          {notifs.length} thông báo
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" /></div>
        ) : notifs.length === 0 ? (
          <div className="py-20 text-center text-gray-300">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-medium">Bạn chưa có thông báo nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifs.map(n => (
              <div key={n._id} className="p-5 hover:bg-gray-50/50 transition-colors flex gap-4">
                <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-sm">{n.title}</h4>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{n.content}</p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                    <Clock className="w-3 h-3" />
                    {new Date(n.sentAt || n.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
                <button className="shrink-0 self-center text-gray-300 hover:text-primary-500 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-500 shrink-0" />
        <p className="text-xs text-blue-700 leading-relaxed font-medium">
          Mẹo: Bạn có thể bật thông báo trình duyệt trong phần cài đặt tài khoản để nhận được tin tức khuyến mãi nhanh nhất ngay cả khi không mở website.
        </p>
      </div>
    </div>
  );
};

export default ProfileNotifications;
