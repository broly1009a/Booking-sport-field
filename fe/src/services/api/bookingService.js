import api from '../index';
import { handleApiCall } from '../../utils/handleApi';

export const bookingService = {
  createBooking: async (data) => {
    return handleApiCall(() => api.post('/booking', data));
  },

  getAllBookings: async () => {
    return handleApiCall(() => api.get('/booking'));
  },

  getBookingById: async (id) => {
    return handleApiCall(() => api.get(`/booking/${id}`));
  },

  updateBooking: async (id, data) => {
    return handleApiCall(() => api.put(`/booking/${id}`, data));
  },

  deleteBooking: async (id) => {
    return handleApiCall(() => api.delete(`/booking/${id}`));
  },

  getPaginatedBookings: async (params) => {
    // params: { page, limit, status, fieldId, from, to }
    return handleApiCall(() => api.get('/booking/paginated', { params }));
  },
  getBookingsByUser: async (userId) => {
    return handleApiCall(() => api.get(`/booking/user/${userId}`));
  },

  roundAllBookingTimesToHour: async () => {
    return handleApiCall(() => api.patch('/booking/round-all-times'));
  },
};

export default bookingService;