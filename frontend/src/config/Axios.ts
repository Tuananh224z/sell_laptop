import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Gắn access token vào mỗi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh khi nhận 401
let isRefreshing = false;
let failedQueue: { resolve: (v: string) => void; reject: (e: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

// Các URL không cần auto-refresh (tránh loop)
const NO_REFRESH_URLS = ['/auth/refresh', '/auth/login', '/auth/register', '/auth/me'];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isNoRefresh = NO_REFRESH_URLS.some(u => original?.url?.includes(u));

    if (error.response?.status === 401 && !original._retry && !isNoRefresh) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          })
          .catch((e) => Promise.reject(e));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          '/api/auth/refresh', {},
          { withCredentials: true, baseURL: 'http://localhost:5000' }
        );
        localStorage.setItem('accessToken', data.accessToken);
        processQueue(null, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (e) {
        processQueue(e, null);
        localStorage.removeItem('accessToken');

        // Chỉ redirect nếu không đang ở login/register
        const guestPaths = ['/login', '/register', '/forgot-password'];
        const atGuestPage = guestPaths.some(p => window.location.pathname.startsWith(p));
        if (!atGuestPage) {
          window.location.href = '/login';
        }

        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
