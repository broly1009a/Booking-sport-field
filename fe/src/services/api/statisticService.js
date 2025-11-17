import api from '../index';
import { handleApiCall } from '../../utils/handleApi';

const statisticService = {
    getDashboardStats: async (from, to) => {
        const params = new URLSearchParams();
        if (from) params.append('from', from);
        if (to) params.append('to', to);
        
        return handleApiCall(() => api.get(`/statistic/dashboard?${params.toString()}`));
    },
    getOwnerStats: async (ownerId, from, to) => {
        const params = new URLSearchParams();
        if (ownerId) params.append('ownerId', ownerId);
        if (from) params.append('from', from);
        if (to) params.append('to', to);
        return handleApiCall(() => api.get(`/statistic/owner-stats?${params.toString()}`));
    },
    getOwnerMonthlyPayoutList: async (ownerId, month, year) => {
        const params = new URLSearchParams();
        if (ownerId) params.append('ownerId', ownerId);
        if (month) params.append('month', month);
        if (year) params.append('year', year);
        return handleApiCall(() => api.get(`/statistic/owner-monthly-payout-list?${params.toString()}`));
    },
    getStaffStats: async (staffId, from, to) => {
        const params = new URLSearchParams();
        if (staffId) params.append('staffId', staffId);
        if (from) params.append('from', from);
        if (to) params.append('to', to);
        return handleApiCall(() => api.get(`/statistic/staff-stats?${params.toString()}`));
    }
};

export default statisticService;