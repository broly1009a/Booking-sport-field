import api from '../index';
import { handleApiCall } from '../../utils/handleApi';

const newsService = {
    getAllNews: async () => {
        return handleApiCall(() => api.get('/news'));
    },
    getNewsById: async (id) => {
        return handleApiCall(() => api.get(`/news/${id}`));
    },
    createNews: async (data) => {
        return handleApiCall(() => api.post('/news', data));
    },
    updateNews: async (id, data) => {
        return handleApiCall(() => api.put(`/news/${id}`, data));
    },
    deleteNews: async (id) => {
        return handleApiCall(() => api.delete(`/news/${id}`));
    }
};

export default newsService;