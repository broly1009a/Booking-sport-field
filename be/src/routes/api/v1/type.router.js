const express = require('express');
const router = express.Router();
const TypeController = require('../../../controllers/type.controller');

router.get('/', TypeController.getAllTypes);
router.get('/:id', TypeController.getTypeById);
router.post('/', TypeController.createType);
router.put('/:id', TypeController.updateType);
router.delete('/:id', TypeController.deleteType);

module.exports = router;