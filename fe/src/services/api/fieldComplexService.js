import api from '../index';
import { handleApiCall } from '../../utils/handleApi';

export const fieldComplexService = {
    create: (data) => {
        if (data instanceof FormData) {
            return handleApiCall(() => api.post('/field-complex', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }));
        }
        return handleApiCall(() => api.post('/field-complex', data));
    },
    getAll: () =>
        handleApiCall(() => api.get('/field-complex')),
    getById: (id) =>
        handleApiCall(() => api.get(`/field-complex/${id}`)),
    update: (id, data) => {
        if (data instanceof FormData) {
            return handleApiCall(() => api.put(`/field-complex/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }));
        }
        return handleApiCall(() => api.put(`/field-complex/${id}`, data));
    },
    delete: (id) =>
        handleApiCall(() => api.delete(`/field-complex/${id}`)),
    addStaffToFieldComplex: (id, staffId) =>
        handleApiCall(() => api.put(`/field-complex/${id}/add-staff`, { staffId })),
    removeStaffFromFieldComplex: (id, staffId) =>
        handleApiCall(() => api.put(`/field-complex/${id}/remove-staff`, { staffId })),
    getAvailableStaff: () =>
        handleApiCall(() => api.get('/field-complex/users/available-staff'))
};