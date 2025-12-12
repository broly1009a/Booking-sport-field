import api from '../index';
import { handleApiCall } from '../../utils/handleApi';

export const consumableService = {
    createConsumable: async (data) => {
        return handleApiCall(() => api.post('/consumable', data));
    },

    updateConsumable: async (id, data) => {
        return handleApiCall(() => api.put(`/consumable/${id}`, data));
    },

    getAllConsumables: async () => {
        return handleApiCall(() => api.get('/consumable'));
    },

    getConsumableById: async (id) => {
        return handleApiCall(() => api.get(`/consumable/${id}`));
    },

    deleteConsumable: async (id) => {
        return handleApiCall(() => api.delete(`/consumable/${id}`));
    },
    // router.get('/sport-field/:sportFieldId', ConsumableController.getAvailableConsumablesBySportField);
    getAvailableConsumablesBySportField: async (sportFieldId) => {
        return handleApiCall(() => api.get(`/consumable/sport-field/${sportFieldId}/available`));
    },
    getAllConsumablesByStaff: async (staffId) => {
        return handleApiCall(() => api.get(`/consumable/staff/${staffId}`));
    }
};
export default consumableService;