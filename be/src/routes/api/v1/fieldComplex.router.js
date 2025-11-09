const express = require('express');
const router = express.Router();
const fieldComplexController = require('../../../controllers/fieldComplex.controller');
const userController = require('../../../controllers/user.controller');
router.get('/users/available-staff', userController.getAvailableStaff);

router.post('/', fieldComplexController.createFieldComplex);
router.get('/', fieldComplexController.getAllFieldComplexes);
router.get('/:id', fieldComplexController.getFieldComplexById);
router.put('/:id', fieldComplexController.updateFieldComplex);
router.put('/:id/add-staff', fieldComplexController.addStaffToFieldComplex);
router.put('/:id/remove-staff', fieldComplexController.removeStaffFromFieldComplex);
router.delete('/:id', fieldComplexController.deleteFieldComplex);

module.exports = router;
