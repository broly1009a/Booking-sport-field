import api from '../index';
import { handleApiCall } from '../../utils/handleApi';
const notificationService = {
  getList: (params) => handleApiCall(() => api.get('/notification', { params })),

  markAllRead: () => handleApiCall(() => api.patch('/notification/read-all')),

  markRead: (id) => handleApiCall(() => api.patch(`/notification/${id}/read`)),

  deleteRead: () => handleApiCall(() => api.delete('/notification/read')),

  delete: (id) => handleApiCall(() => api.delete(`/notification/${id}`)),
};
export default notificationService;