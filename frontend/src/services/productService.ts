import api from '../config/Axios';

export const productService = {
    getAll: (params?: any) => api.get('/products', { params }),
    getOne: (id: string) => api.get(`/products/${id}`),
    incrementView: (id: string) => api.post(`/products/${id}/view`),
};
