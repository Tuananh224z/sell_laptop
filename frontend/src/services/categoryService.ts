import api from '../config/Axios';

export const categoryService = {
    getAll: (params?: any) => api.get('/categories', { params }),
};
