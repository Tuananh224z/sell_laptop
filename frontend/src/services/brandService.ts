import api from '../config/Axios';

export const brandService = {
    getAll: (params?: any) => api.get('/brands', { params }),
};
