import api from '../index';
import { handleApiCall } from '../../utils/handleApi';

export const consumablePurchaseService = {
    createConsumablePurchase: async (data) => {
        return handleApiCall(() => api.post('/consumable-purchase', data));
    },

    updateConsumablePurchase: async (id, data) => {
        return handleApiCall(() => api.put(`/consumable-purchase/${id}`, data));
    },

    getAllConsumablePurchases: async () => {
        return handleApiCall(() => api.get('/consumable-purchase'));
    },

    getConsumablePurchaseById: async (id) => {
        return handleApiCall(() => api.get(`/consumable-purchase/${id}`));
    },

    deleteConsumablePurchase: async (id) => {
        return handleApiCall(() => api.delete(`/consumable-purchase/${id}`));
    }
};

export default consumablePurchaseService;