import api from '../index';
import { handleApiCall } from '../../utils/handleApi';

export const policyService = {
    createPolicy: (data) => 
        handleApiCall(() => api.post("/policy", data)),

    getPolicies: () => 
        handleApiCall(() => api.get("/policy")),

    getPolicyById: (id) => 
        handleApiCall(() => api.get(`/policy/${id}`)),

    updatePolicy: (id, data) => 
        handleApiCall(() => api.put(`/policy/${id}`, data)),

    deletePolicy: (id) => 
        handleApiCall(() => api.delete(`/policy/${id}`)),
};
