import api from '../config/Axios';

export const authService = {
    login: (credentials: any) => api.post('/auth/login', credentials),
    register: (userData: any) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    toggleWishlist: (productId: string) => api.post(`/auth/wishlist/${productId}`),
};
