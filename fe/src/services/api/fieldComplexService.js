import api from '../index';
import { handleApiCall } from '../../utils/handleApi';

export const fieldComplexService = {
    create: (data) =>
        handleApiCall(() => api.post('/field-complex', data)),
    getAll: () =>
        handleApiCall(() => api.get('/field-complex')),
    getById: (id) =>
        handleApiCall(() => api.get(`/field-complex/${id}`)),
    update: (id, data) =>
        handleApiCall(() => api.put(`/field-complex/${id}`, data)),
    delete: (id) =>
        handleApiCall(() => api.delete(`/field-complex/${id}`)),
};