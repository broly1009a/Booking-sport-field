import api from '../index';
import { handleApiCall } from '../../utils/handleApi';

export const equipmentService = {
    createEquipment: async (data) => {
        return handleApiCall(() => api.post('/equipment', data));
    },

    updateEquipment: async (id, data) => {
        return handleApiCall(() => api.put(`/equipment/${id}`, data));
    },

    getAllEquipment: async () => {
        return handleApiCall(() => api.get('/equipment'));
    },

    getEquipmentById: async (id) => {
        return handleApiCall(() => api.get(`/equipment/${id}`));
    },

    deleteEquipment: async (id) => {
        return handleApiCall(() => api.delete(`/equipment/${id}`));
    },

    getEquipmentBySportField: async (sportFieldId) => {
        return handleApiCall(() => api.get(`/equipment/sport-field/${sportFieldId}`));
    },

    getAvailableEquipmentBySportField: async (sportFieldId) => {
        return handleApiCall(() => api.get(`/equipment/sport-field/${sportFieldId}/available`));
    }
};

export default equipmentService;