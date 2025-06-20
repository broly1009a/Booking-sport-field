const express = require('express');
const router = express.Router();
const EquipmentRentalController = require('../../../controllers/equipmentRental.controller');

router.get('/', EquipmentRentalController.getAll);
router.get('/:id', EquipmentRentalController.getById);
router.post('/', EquipmentRentalController.create);
router.put('/:id', EquipmentRentalController.update);
router.delete('/:id', EquipmentRentalController.delete);

module.exports = router;