import api from '../config/Axios';

export const cartService = {
    getCart: () => api.get('/cart'),
    addToCart: (data: { productId: string, variantId?: string, quantity: number }) => api.post('/cart/add', data),
    updateQuantity: (id: string, quantity: number) => api.patch(`/cart/${id}`, { quantity }),
    removeFromCart: (id: string) => api.delete(`/cart/${id}`),
    clearCart: () => api.delete('/cart'),
};
