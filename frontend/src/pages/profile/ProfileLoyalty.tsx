import { useState, useEffect } from 'react';
import { Star, Crown, Award, Gift, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

type Tier = {
  _id: string;
  name: string;
  minPoints: number;
  discount: number;
  color: string;
  icon: string;
  benefits: string[];
};

const ProfileLoyalty = () => {
  const { user } = useAuth();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const { data } = await api.get('/membership/tiers');
        setTiers(data.sort((a: Tier, b: Tier) => a.minPoints - b.minPoints));
      } catch (err) {
        console.error('Lỗi tải hạng thành viên');
      } finally {
        setLoading(false);
      }
    };
    fetchTiers();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-medium">Đang tải dữ liệu hội viên...</p>
      </div>
    );
  }

  const points = user?.points || 0;
  
  // Find current tier
  const activeTierIndex = [...tiers].reverse().findIndex(t => points >= t.minPoints);
  const actualActiveIndex = activeTierIndex === -1 ? 0 : tiers.length - 1 - activeTierIndex;
  
  const currentTier = tiers[actualActiveIndex];
  const nextTier = tiers[actualActiveIndex + 1] ?? null;

  const progressToNext = nextTier
    ? Math.min(100, Math.round(((points - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100))
    : 100;

  const needed = nextTier ? nextTier.minPoints - points : 0;

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Hạng thành viên hiện tại</p>
            <div className="flex items-center gap-2" style={{ color: currentTier?.color || '#333' }}>
              <span className="text-3xl">{currentTier?.icon || '👤'}</span>
              <h2 className="text-2xl font-extrabold">{currentTier?.name || 'Thành viên'}</h2>
            </div>
          </div>
          <div className="px-5 py-2 rounded-full bg-gray-50 border border-gray-100 text-sm font-semibold text-gray-600">
             🌟 Điểm tích lũy: <span className="text-primary-600">{points.toLocaleString('vi-VN')}</span>
          </div>
        </div>

        {nextTier && (
          <div className="mt-6">
            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              <span>{currentTier?.name}</span>
              <span>{nextTier?.name}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-3 font-medium">
              Cần tích thêm <span className="font-bold text-primary-600">{needed.toLocaleString('vi-VN')} điểm</span> để đạt {nextTier?.name}
            </p>
          </div>
        )}

        {!nextTier && (
          <div className="mt-6 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 font-bold flex items-center gap-2">
            ✨ Bạn đã đạt hạng cao nhất: {currentTier?.name}!
          </div>
        )}
      </div>

      {/* Benefits of current tier */}
      {currentTier?.benefits && currentTier.benefits.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary-500" />
            Quyền lợi của bạn
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentTier.benefits.map(b => (
              <li key={b} className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100/50">
                <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 text-[10px]">✓</span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* All Tiers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-4">Các hạng thành viên</h3>
        <div className="space-y-3">
          {tiers.map((tier, idx) => {
            const isActive = idx === actualActiveIndex;
            return (
              <div
                key={tier._id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-primary-50/30 border-primary-100 shadow-sm'
                    : 'border-gray-100 bg-gray-50/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-2xl ${isActive ? 'grayscale-0' : 'grayscale opacity-50'}`}>
                    {tier.icon}
                  </span>
                  <div>
                    <p className={`font-bold text-sm ${isActive ? 'text-primary-700' : 'text-gray-600'}`}>
                      {tier.name}
                      {isActive && <span className="ml-2 text-[10px] bg-primary-600 text-white rounded-full px-2 py-0.5 uppercase tracking-tighter">Của bạn</span>}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-0.5">
                      {tier.minPoints === 0 ? 'Mặc định' : `Từ ${tier.minPoints.toLocaleString('vi-VN')} điểm`}
                    </p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${isActive ? 'text-primary-400' : 'text-gray-300'}`} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProfileLoyalty;
