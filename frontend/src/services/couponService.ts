import api from '../config/Axios';

export const couponService = {
    getAll: () => api.get('/coupons'),
    validate: (code: string) => api.post('/coupons/validate', { code }),
};
