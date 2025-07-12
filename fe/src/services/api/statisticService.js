import api from '../index';
import { handleApiCall } from '../../utils/handleApi';

const statisticService = {
    getDashboardStats: async (from, to) => {
        const params = new URLSearchParams();
        if (from) params.append('from', from);
        if (to) params.append('to', to);
        
        return handleApiCall(() => api.get(`/statistic/dashboard?${params.toString()}`));
    }
};

export default statisticService;