const express = require('express');
const router = express.Router();
const PolicyController = require('../../../controllers/policy.controller');

router.get('/', PolicyController.getPolicy);
router.get('/:id', PolicyController.getPolicyById);
router.post('/', PolicyController.createPolicy);
router.put('/:id', PolicyController.updatePolicy);
router.delete('/:id', PolicyController.deletePolicy);

module.exports = router;