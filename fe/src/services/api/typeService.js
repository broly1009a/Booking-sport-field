import api from '../index';
import { handleApiCall } from '../../utils/handleApi';

const typeService = {
    createType: async (data) => {
        return handleApiCall(() => api.post('/type', data));
    },

    updateType: async (id, data) => {
        return handleApiCall(() => api.put(`/type/${id}`, data));
    },

    getAllTypes: async () => {
        return handleApiCall(() => api.get('/type'));
    },

    getTypeById: async (id) => {
        return handleApiCall(() => api.get(`/type/${id}`));
    }
    ,
    deleteType: async (id) => {
        return handleApiCall(() => api.delete(`/type/${id}`));
    }
};
export default typeService;