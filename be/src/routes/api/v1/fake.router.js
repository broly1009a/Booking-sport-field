const express = require('express');
const router = express.Router();
const FakeController = require('../../../controllers/fake.controller');

router.post('/', FakeController.generateAllFakeData);

module.exports = router;