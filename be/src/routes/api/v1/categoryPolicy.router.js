const express = require('express');
const router = express.Router();
const CategoryPolicyController = require('../../../controllers/categoryPolicy.controller');

router.get('/', CategoryPolicyController.getAllCategory);
router.get('/:id', CategoryPolicyController.getCategoryById);
router.post('/', CategoryPolicyController.createCategory);
router.put('/:id', CategoryPolicyController.updateCategory);
router.delete('/:id', CategoryPolicyController.deleteCategory);

module.exports = router;