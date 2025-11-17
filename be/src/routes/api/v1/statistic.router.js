const express = require('express');
const router = express.Router();
const StatisticController = require('../../../controllers/statistic.controller');

// GET /api/v1/statistic/dashboard?from=2024-06-01&to=2024-06-30
router.get('/dashboard', StatisticController.getDashboardStats);

// GET /api/v1/statistic/owner-stats?ownerId=...&from=...&to=...
router.get('/owner-stats', StatisticController.getOwnerStats);

// GET /api/v1/statistic/owner-monthly-payout-list?ownerId=...&month=...&year=...
router.get('/owner-monthly-payout-list', StatisticController.getOwnerMonthlyPayoutList);

// GET /api/v1/statistic/staff-stats?staffId=...&from=...&to=...
router.get('/staff-stats', StatisticController.getStaffStats);

module.exports = router;