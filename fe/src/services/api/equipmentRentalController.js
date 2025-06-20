import api from '../index';
import { handleApiCall } from '../../utils/handleApi';

export const equipmentRentalService = {
    createEquipmentRental: async (data) => {
        return handleApiCall(() => api.post('/equipment-rental', data));
    },

    updateEquipmentRental: async (id, data) => {
        return handleApiCall(() => api.put(`/equipment-rental/${id}`, data));
    },

    getAllEquipmentRentals: async () => {
        return handleApiCall(() => api.get('/equipment-rental'));
    },

    getEquipmentRentalById: async (id) => {
        return handleApiCall(() => api.get(`/equipment-rental/${id}`));
    },

    deleteEquipmentRental: async (id) => {
        return handleApiCall(() => api.delete(`/equipment-rental/${id}`));
    },
};

export default equipmentRentalService;

