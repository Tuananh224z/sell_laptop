import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tag,
  Award,
  ShoppingBag,
  Star,
  Users,
  MessageSquare,
  ChevronLeft,
  Menu,
  X,
  Bell,
  LogOut,
  ExternalLink,
  Percent,
  BellRing,
  HeadphonesIcon,
  Settings,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const BACKEND =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
const getAvatar = (url?: string) =>
  url ? (url.startsWith("http") ? url : `${BACKEND}${url}`) : null;

const navGroups = [
  {
    label: "Hàng hoá",
    items: [
      { to: "/admin", label: "Tổng quan", icon: LayoutDashboard, end: true },
      { to: "/admin/products", label: "Sản phẩm", icon: Package },
      { to: "/admin/inventory", label: "Quản lý kho", icon: Package },
      { to: "/admin/categories", label: "Danh mục", icon: Tag },
      { to: "/admin/brands", label: "Thương hiệu", icon: Award },
    ],
  },
  {
    label: "Kinh doanh",
    items: [
      { to: "/admin/orders", label: "Đơn hàng", icon: ShoppingBag },
      { to: "/admin/promotions", label: "Khuyến mại", icon: Percent },
    ],
  },
  {
    label: "Khách hàng",
    items: [
      { to: "/admin/users", label: "Người dùng", icon: Users },
      { to: "/admin/reviews", label: "Đánh giá", icon: Star },
      { to: "/admin/support", label: "Hỗ trợ KH", icon: HeadphonesIcon },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      { to: "/admin/notifications", label: "Thông báo", icon: BellRing },
      { to: "/admin/chat", label: "Tin nhắn", icon: MessageSquare },
      { to: "/admin/settings", label: "Cài đặt", icon: Settings },
    ],
  },
];

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const adminInitials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AD";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={`flex items-center gap-3 px-4 py-5 border-b border-gray-800 ${collapsed ? "justify-center" : ""}`}
      >
        {!collapsed && (
          <span className="font-bold text-white text-lg tracking-tight">
            Admin TechStore
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-4 px-2">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-1">
                {group.label}
              </p>
            )}
            {group.items.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                    isActive
                      ? "bg-primary-600 text-white shadow-lg shadow-primary-900/30"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  } ${collapsed ? "justify-center" : ""}`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-800 p-3 space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all ${collapsed ? "justify-center" : ""}`}
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Xem trang chủ</span>}
        </a>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-gray-900 transition-all duration-300 shrink-0 ${collapsed ? "w-16" : "w-60"}`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 bg-gray-900 flex flex-col h-full shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 h-14 flex items-center gap-4 shrink-0">
          {/* Mobile menu */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <Menu className="w-5 h-5" />
          </button>
          {/* Collapse (desktop) */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronLeft
              className={`w-5 h-5 transition-transform ${collapsed ? "rotate-180" : ""}`}
            />
          </button>

          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-primary-100 flex items-center justify-center">
                {getAvatar(user?.avatar) ? (
                  <img
                    src={getAvatar(user?.avatar)!}
                    alt={user?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs uppercase">
                    {adminInitials}
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden md:block">
                {user?.name ?? "Admin"}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
