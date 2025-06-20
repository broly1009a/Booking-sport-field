const express = require('express');
const router = express.Router();
const { GuestController } = require('../../../controllers/index');
const { AuthMiddleware } = require('../../../middlewares/index');

/**
 * author: XXX
 */
router.post('/insert-guest', AuthMiddleware.checkRoles(['GUEST', 'ADMIN']), GuestController.insertGuest);

module.exports = router;
