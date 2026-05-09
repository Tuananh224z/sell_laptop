import api from '../config/Axios';

export const membershipService = {
    getTiers: () => api.get('/membership/tiers'),
    getMyStatus: () => api.get('/membership/status'),
};
