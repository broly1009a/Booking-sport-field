const express = require('express');
const router = express.Router();
const { EquipmentController } = require('../../../controllers/index');

router.get('/', EquipmentController.getAllEquipment);
router.get('/sport-field/:sportFieldId', EquipmentController.getEquipmentBySportField);
router.get('/sport-field/:sportFieldId/available', EquipmentController.getAvailableEquipmentBySportField);
router.get('/:id', EquipmentController.getEquipmentById);
router.post('/', EquipmentController.createEquipment);
router.put('/:id', EquipmentController.updateEquipment);
router.delete('/:id', EquipmentController.deleteEquipment);


module.exports = router;
