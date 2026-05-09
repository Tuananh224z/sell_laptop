import api from '../config/Axios';

export const settingService = {
    getSettings: () => api.get('/settings'),
};
