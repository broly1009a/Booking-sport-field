import api from '../index';
import { handleApiCall } from '../../utils/handleApi';

const maintenanceService = {
    
    getMaintenance: async (params) => {
        return await handleApiCall(api.get('/maintenance', { params }));
    }
    ,
    getMaintenanceById: async (id) => {
        return await handleApiCall(api.get(`/maintenance/${id}`));
    },
    createMaintenance: async (data) => {
        return await handleApiCall(api.post('/maintenance', data));
    },
    updateMaintenance: async (id, data) => {
        return await handleApiCall(api.put(`/maintenance/${id}`, data));
    },
    deleteMaintenance: async (id) => {
        return await handleApiCall(api.delete(`/maintenance/${id}`));
    }
    };

    export default maintenanceService;