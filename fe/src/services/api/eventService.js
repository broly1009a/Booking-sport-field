import api from '../index';
import { handleApiCall } from '../../utils/handleApi';

export const eventService = {
    // Tìm kiếm và lọc event
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
    getUserSchedule: async () => {
        const response = await handleApiCall(() => api.get('/event/my-schedule'));
        return response.data;
    },
    checkTimeConflict: async (startTime, endTime) => {
        const response = await handleApiCall(() => api.post('/event/check-conflict', { startTime, endTime }));
        return response;
    },

    // Quản lý event
    createEvent: async (data) => {
        const response = await handleApiCall(() => api.post('/event', data));
        return response.data;
    },
    getEventById: async (id) => {
        const response = await handleApiCall(() => api.get(`/event/${id}`));
        return response.data;
    },
    updateEvent: async (id, data) => {
        const response = await handleApiCall(() => api.put(`/event/${id}`, data));
        return response.data;
    },
    deleteEvent: async (id) => {
        const response = await handleApiCall(() => api.delete(`/event/${id}`));
        return response.data;
    },

    // Xử lý người tham gia
    showInterest: async (id, note = '') => {
        const response = await handleApiCall(() => api.post(`/event/${id}/interest`, { note }));
        return response.data;
    },
    leaveEvent: async (id) => {
        const response = await handleApiCall(() => api.delete(`/event/${id}/leave`));
        return response.data;
    },

    // Quản lý người chơi (chỉ creator)
    acceptPlayer: async (id, playerId) => {
        const response = await handleApiCall(() => api.post(`/event/${id}/players/${playerId}/accept`));
        return response.data;
    },
    rejectPlayer: async (id, playerId) => {
        const response = await handleApiCall(() => api.post(`/event/${id}/players/${playerId}/reject`));
        return response.data;
    },
    removePlayer: async (id, playerId) => {
        const response = await handleApiCall(() => api.delete(`/event/${id}/players/${playerId}`));
        return response.data;
    },

    // Chuyển đổi thành booking
    convertToBooking: async (id) => {
        const response = await handleApiCall(() => api.post(`/event/${id}/convert-to-booking`));
        return response.data;
    },

    // Kiểm tra status
    checkEventStatus: async (id) => {
        const response = await handleApiCall(() => api.get(`/event/${id}/check-status`));
        return response.data;
    },
};