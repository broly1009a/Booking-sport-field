import api from '../index';
import { handleApiCall } from '../../utils/handleApi';

export const sportFieldService = {
    
    createSportField: async (data, images = []) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            formData.append(key, data[key]);
        });
        images.forEach(img => {
            formData.append('images', img);
        });
        return handleApiCall(() =>
            api.post('/sport-field', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
        );
    },

    updateSportField: async (id, data, images = []) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            formData.append(key, data[key]);
        });
        images.forEach(img => {
            formData.append('images', img);
        });
        return handleApiCall(() =>
            api.put(`/sport-field/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
        );
    },

    getAllSportFields: async () => {
        return handleApiCall(() => api.get('/sport-field'));
    },
    getSportFieldById: async (id) => {
        return handleApiCall(() => api.get(`/sport-field/${id}`));
    },
    deleteSportField: async (id) => {
        return handleApiCall(() => api.delete(`/sport-field/${id}`));
    },
    getSportFieldsByStaff: async (staffId) => {
        return handleApiCall(() => api.get(`/sport-field/by-staff/${staffId}`));
    },
    getSportFieldsByOwner: async (ownerId) => {
        return handleApiCall(() => api.get(`/sport-field/by-owner/${ownerId}`));
    }
};

export default sportFieldService;