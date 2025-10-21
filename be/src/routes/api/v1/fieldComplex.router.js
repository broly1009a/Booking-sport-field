const express = require('express');
const router = express.Router();
const fieldComplexController = require('../../../controllers/fieldComplex.controller');

router.post('/', fieldComplexController.createFieldComplex);
router.get('/', fieldComplexController.getAllFieldComplexes);
router.get('/:id', fieldComplexController.getFieldComplexById);
router.put('/:id', fieldComplexController.updateFieldComplex);
router.delete('/:id', fieldComplexController.deleteFieldComplex);

module.exports = router;
