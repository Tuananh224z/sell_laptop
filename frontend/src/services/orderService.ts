import api from '../config/Axios';

export const orderService = {
    createOrder: (orderData: any) => api.post('/orders', orderData),
    getMyOrders: (params?: any) => api.get('/orders/my-orders', { params }),
    getOrderDetails: (id: string) => api.get(`/orders/${id}`),
    cancelOrder: (id: string) => api.post(`/orders/${id}/cancel`),
};
