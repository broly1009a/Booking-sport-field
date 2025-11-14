import api from '../index';
import { handleApiCall } from '../../utils/handleApi';

export const eventServiceForUser = {
    // Xem event
    searchEvent: async (filters) => {
        const response = await handleApiCall(() => api.get('/event/search', { params: filters }));
        return response.data;
    },
    getAvailableEvents: async () => {
        const response = await handleApiCall(() => api.get('/event/available'));
        return response.data;
    },
    getMyEvents: async () => {
        const response = await handleApiCall(() => api.get('/event/my-events'));
        return response.data;
    },
    getEventById: async (id) => {
        const response = await handleApiCall(() => api.get(`/event/${id}`));
        return response.data;
    },
    checkEventStatus: async (id) => {
        const response = await handleApiCall(() => api.get(`/event/${id}/check-status`));
        return response.data;
    },

    // Tham gia event
    showInterest: async (id, note = '') => {
        const response = await handleApiCall(() => api.post(`/event/${id}/interest`, { note }));
        return response.data;
    },
    leaveEvent: async (id) => {
        const response = await handleApiCall(() => api.delete(`/event/${id}/leave`));
        return response.data;
    },
};
