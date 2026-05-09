import api from '../config/Axios';

export const supportService = {
    createTicket: (data: any) => api.post('/support/tickets', data),
    getMyTickets: () => api.get('/support/tickets'),
    getTicketDetails: (id: string) => api.get(`/support/tickets/${id}`),
};
