/**
 * Route Guards
 *
 * - <RequireAuth>  : phải đăng nhập, không thì redirect /login
 * - <RequireAdmin> : phải là admin, không thì redirect /
 * - <GuestOnly>    : đã đăng nhập thì redirect /, không vào login/register được
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/* ─── Loading Spinner ─── */
const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-3">
      <svg className="animate-spin w-10 h-10 text-primary-600" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="text-sm text-gray-500 font-medium">Đang tải...</p>
    </div>
  </div>
);

/* ─── RequireAuth: phải đăng nhập ─── */
export const RequireAuth = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
};

/* ─── RequireAdmin: phải là admin ─── */
export const RequireAdmin = () => {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;

  // Chưa đăng nhập → về login
  if (!user) return <Navigate to="/login" replace />;

  // Đã đăng nhập nhưng không phải admin → về trang chủ
  if (user.role !== 'admin') return <Navigate to="/" replace />;

  return <Outlet />;
};

/* ─── GuestOnly: đã đăng nhập thì không vào login/register ─── */
export const GuestOnly = () => {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
};
