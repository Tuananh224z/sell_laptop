import api from '../config/Axios';

export const notificationService = {
    getMyNotifications: () => api.get('/notifications'),
    markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
    markAllAsRead: () => api.patch('/notifications/read-all'),
};
