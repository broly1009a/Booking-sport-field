import api from '../index';
import { handleApiCall } from '../../utils/handleApi';

export const matchmakingService = {
    getAllMatchmakings: async () => {
        return handleApiCall(() => api.get('/matchmaking'));
    },
    
    getMatchmakingById: async (id) => {
        return handleApiCall(() => api.get(`/matchmaking/${id}`));
    },
    
    createMatchmaking: async (data) => {
        return handleApiCall(() => api.post('/matchmaking', data));
    },
    
    updateMatchmaking: async (id, data) => {
        return handleApiCall(() => api.put(`/matchmaking/${id}`, data));
    },
    
    deleteMatchmaking: async (id) => {
        return handleApiCall(() => api.delete(`/matchmaking/${id}`));
    },
    getOpenMatchmakings: async () => {
        return handleApiCall(() => api.get('/matchmaking/open'));
    },
    joinMatchmaking: async (id, representativeId) => {
        return handleApiCall(() => api.post(`/matchmaking/${id}/join`, { representativeId }));  
    },
    getMatchmakingsByUser: async (userId) => {
        return handleApiCall(() => api.get(`/matchmaking/user/${userId}`));
    },
    closeExpiredOpenMatchmakings: async () => {
        return handleApiCall(() => api.post('/matchmaking/close-expired'));
    }
}
export default matchmakingService;