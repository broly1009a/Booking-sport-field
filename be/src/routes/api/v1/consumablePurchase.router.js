const express = require('express');
const router = express.Router();
const ConsumablePurchaseController = require('../../../controllers/consumablePurchase.controller');

router.get('/', ConsumablePurchaseController.getAll);
router.get('/:id', ConsumablePurchaseController.getById);
router.post('/', ConsumablePurchaseController.create);
router.put('/:id', ConsumablePurchaseController.update);
router.delete('/:id', ConsumablePurchaseController.delete);

module.exports = router;