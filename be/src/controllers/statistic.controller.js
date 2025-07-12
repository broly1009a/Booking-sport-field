const StatisticService = require('../services/statistic.service');

class StatisticController {
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