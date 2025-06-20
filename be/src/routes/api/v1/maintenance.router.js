const express = require('express');
const router = express.Router();
const MaintenanceController = require('../../../controllers/maintenance.controller');

router.get('/', MaintenanceController.getAllMaintenances);
router.get('/:id', MaintenanceController.getMaintenanceById);
router.post('/', MaintenanceController.createMaintenance);
router.put('/:id', MaintenanceController.updateMaintenance);
router.delete('/:id', MaintenanceController.deleteMaintenance);

module.exports = router;