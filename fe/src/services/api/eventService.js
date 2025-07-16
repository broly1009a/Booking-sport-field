import api from '../index';
import { handleApiCall } from '../../utils/handleApi';

export const eventService = {
    createEvent: (data) =>
        handleApiCall(() => api.post('/event', data)),
    getEvents: () =>
        handleApiCall(() => api.get('/event')),
    getEventById: (id) =>
        handleApiCall(() => api.get(`/event/${id}`)),
    updateEvent: (id, data) =>
        handleApiCall(() => api.put(`/event/${id}`, data)),
    deleteEvent: (id) =>
        handleApiCall(() => api.delete(`/event/${id}`)),
};