const express = require('express');
const router = express.Router();
const fieldComplexController = require('../../../controllers/fieldComplex.controller');
const userController = require('../../../controllers/user.controller');
const { cloudinaryFileMiddleware } = require('../../../middlewares/index');

router.get('/users/available-staff', userController.getAvailableStaff);

router.post('/', cloudinaryFileMiddleware.array('images', 10), fieldComplexController.createFieldComplex);
router.get('/', fieldComplexController.getAllFieldComplexes);
router.get('/:id', fieldComplexController.getFieldComplexById);
router.put('/:id', cloudinaryFileMiddleware.array('images', 10), fieldComplexController.updateFieldComplex);
router.put('/:id/add-staff', fieldComplexController.addStaffToFieldComplex);
router.put('/:id/remove-staff', fieldComplexController.removeStaffFromFieldComplex);
router.delete('/:id', fieldComplexController.deleteFieldComplex);

module.exports = router;
