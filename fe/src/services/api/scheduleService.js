import api from '../index';
import { handleApiCall } from '../../utils/handleApi';

export const scheduleService = {
  getAllSchedules: async () => {
    return handleApiCall(() => api.get('/schedule'));
  },

  getSchedulesByComplexId: async (complexId, date) => {
    return handleApiCall(() =>
      api.get(`/schedule/complex/${complexId}/schedules`, { params: { date } })
    );
  },

  getSchedulesByFieldId: async (fieldId) => {
    return handleApiCall(() => api.get(`/schedule/field/${fieldId}`));
  },

  getScheduleById: async (id) => {
    return handleApiCall(() => api.get(`/schedule/${id}`));
  },

  createSchedule: async (data) => {
    return handleApiCall(() => api.post('/schedule', data));
  },

  updateSchedule: async (id, data) => {
    return handleApiCall(() => api.put(`/schedule/${id}`, data));
  },

  deleteSchedule: async (id) => {
    return handleApiCall(() => api.delete(`/schedule/${id}`));
  }
};

export default scheduleService;