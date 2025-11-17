const StatisticService = require('../services/statistic.service');

class StatisticController {

    async getStaffStats(req, res, next) {
        try {
            const { staffId, from, to } = req.query;
            if (!staffId) return res.status(400).json({ success: false, message: 'staffId is required' });
            const stats = await StatisticService.getStaffStats(staffId, { from, to });
            res.status(200).json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }

    async getOwnerMonthlyPayoutList(req, res, next) {
        try {
            const { ownerId, month, year } = req.query;
            // if (!ownerId) return res.status(400).json({ success: false, message: 'ownerId is required' });
            const result = await StatisticService.getOwnerMonthlyPayoutList(ownerId, { month: Number(month), year: Number(year) });
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

        async getOwnerStats(req, res, next) {
            try {
                const { ownerId, from, to } = req.query;
                if (!ownerId) return res.status(400).json({ success: false, message: 'ownerId is required' });
                const stats = await StatisticService.getOwnerStats(ownerId, { from, to });
                res.status(200).json({ success: true, data: stats });
            } catch (error) {
                next(error);
            }
        }
    async getDashboardStats(req, res, next) {
        try {
            const { from, to } = req.query;
            const stats = await StatisticService.getDashboardStats({ from, to });
            res.status(200).json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new StatisticController();