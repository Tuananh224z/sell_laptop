import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  User,
  Package,
  Heart,
  LogOut,
  MapPin,
  KeyRound,
  Headphones,
  Bell,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const BACKEND =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
const getAvatar = (url?: string) =>
  url ? (url.startsWith("http") ? url : `${BACKEND}${url}`) : null;

const ProfileLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "??";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/profile", icon: User, label: "Hồ sơ của tôi", exact: true },
    { path: "/profile/orders", icon: Package, label: "Đơn mua" },
    { path: "/profile/favorites", icon: Heart, label: "Sản phẩm yêu thích" },
    { path: "/profile/addresses", icon: MapPin, label: "Địa chỉ của tôi" },
    { path: "/profile/change-password", icon: KeyRound, label: "Đổi mật khẩu" },
    { path: "/profile/notifications", icon: Bell, label: "Thông báo" },
    { path: "/profile/support", icon: Headphones, label: "Hỗ trợ khách hàng" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex text-sm text-gray-500 mb-6">
          <span className="hover:text-primary-600 cursor-pointer">
            Trang chủ
          </span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Tài khoản của tôi</span>
        </nav>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              {/* Avatar + Info */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary-100 flex items-center justify-center shrink-0">
                  {getAvatar(user?.avatar) ? (
                    <img
                      src={getAvatar(user?.avatar)!}
                      alt={user?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xl uppercase">
                      {initials}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">
                    {user?.name ?? "Người dùng"}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Thành viên</p>
                </div>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors text-sm ${
                        isActive
                          ? "bg-primary-50 text-primary-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-primary-600"
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </NavLink>
                ))}

                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm text-red-600 hover:bg-red-50 transition-colors mt-2 pt-4 border-t border-gray-100"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Đăng xuất
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:w-3/4">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
