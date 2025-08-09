import api from '../index';
import { handleApiCall } from '../../utils/handleApi';

export const favoriteService = {

    getFavorites: async (userId) => {

        return handleApiCall(() => api.get(`/favorite/my-favorites`, { params: { userId } }));
    },

    toggleFavorite: async ({ userId, fieldId }) => {
        return handleApiCall(() => api.post(`/favorite/toggle`, { userId, fieldId }));
    }
};