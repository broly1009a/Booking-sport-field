


// router
const express = require('express');
const router = express.Router();
const { ConsumableController } = require('../../../controllers/index');

router.get('/', ConsumableController.getAllConsumables);
router.get('/sport-field/:sportFieldId/available', ConsumableController.getAvailableConsumablesBySportField);
router.get('/:id', ConsumableController.getConsumableById);
router.post('/', ConsumableController.createConsumable);
router.put('/:id', ConsumableController.updateConsumable);
router.delete('/:id', ConsumableController.deleteConsumable);

module.exports = router;