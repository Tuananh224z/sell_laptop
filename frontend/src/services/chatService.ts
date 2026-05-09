import api from '../config/Axios';

export const chatService = {
    getMessages: (conversationId: string) => api.get(`/chat/messages/${conversationId}`),
    sendMessage: (data: any) => api.post('/chat/send', data),
};
