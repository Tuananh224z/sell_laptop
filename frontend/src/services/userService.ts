import api from '../config/Axios';

export const userService = {
    getAll: () => api.get('/users'),
    getOne: (id: string) => api.get(`/users/${id}`),
    update: (id: string, data: any) => api.put(`/users/${id}`, data),
    delete: (id: string) => api.delete(`/users/${id}`),
    toggleStatus: (id: string) => api.patch(`/users/${id}/toggle`),
    resetPassword: (id: string) => api.patch(`/users/${id}/reset-password`),
};
