const express = require('express');
const router = express.Router();
const notificationController = require('../../../controllers/notification.controller');
const { UserController } = require('../../../controllers/index');
const { AuthMiddleware } = require('../../../middlewares/index');

router.use(AuthMiddleware.checkRoles(['CUSTOMER', 'STAFF', 'MANAGER', 'ADMIN']));

// GET /api/notifications - Lấy danh sách
router.get('/', notificationController.getList);

// PATCH /api/notifications/read-all - Đánh dấu tất cả đã đọc
router.patch('/read-all', notificationController.markAllRead);

// PATCH /api/notifications/:id/read - Đánh dấu đã đọc
router.patch('/:id/read', notificationController.markRead);

// DELETE /api/notifications/read - Xóa đã đọc
router.delete('/read', notificationController.deleteRead);

// DELETE /api/notifications/:id - Xóa
router.delete('/:id', notificationController.delete);

module.exports = router;
