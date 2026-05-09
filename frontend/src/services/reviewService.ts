import api from '../config/Axios';

export const reviewService = {
    getProductReviews: (productId: string) => api.get(`/reviews/${productId}`),
    createReview: (productId: string, data: any) => api.post(`/reviews/${productId}`, data),
    checkEligibility: (productId: string) => api.get(`/reviews/${productId}/check`),
    deleteReview: (id: string) => api.delete(`/reviews/${id}`),
};
