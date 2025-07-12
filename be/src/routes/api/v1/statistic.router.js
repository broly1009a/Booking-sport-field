const express = require('express');
const router = express.Router();
const StatisticController = require('../../../controllers/statistic.controller');

// GET /api/v1/statistic/dashboard?from=2024-06-01&to=2024-06-30
router.get('/dashboard', StatisticController.getDashboardStats);

module.exports = router;