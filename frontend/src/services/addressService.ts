import api from '../config/Axios';

export const addressService = {
    getMyAddresses: () => api.get('/addresses'),
    create: (data: any) => api.post('/addresses', data),
    update: (id: string, data: any) => api.put(`/addresses/${id}`, data),
    delete: (id: string) => api.delete(`/addresses/${id}`),
    setDefault: (id: string) => api.patch(`/addresses/${id}/default`),
};
