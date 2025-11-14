const express = require('express');
const router = express.Router();
const EventController = require('../../../controllers/event.controller');
const authMiddleware = require('../../../middlewares/auth.middleware');

// Bảo vệ tất cả các routes với authentication
router.use(authMiddleware.checkRoles(['USER', 'STAFF', 'MANAGER', 'ADMIN']));

// Tìm kiếm và lọc event
router.get('/search', EventController.searchEvent);
router.get('/available', EventController.getAvailableEvent);
router.get('/my-events', EventController.getMyEvent);

// Quản lý event (chỉ chủ sân/staff tạo event)
router.post('/', authMiddleware.checkRoles(['STAFF', 'MANAGER', 'ADMIN']), EventController.createEvent);
router.get('/:id', EventController.getEventById);
router.put('/:id', authMiddleware.checkRoles(['STAFF', 'MANAGER', 'ADMIN']), EventController.updateEvent);
router.delete('/:id', authMiddleware.checkRoles(['STAFF', 'MANAGER', 'ADMIN']), EventController.deleteEvent);

// Xử lý người tham gia (USER tham gia event)
router.post('/:id/interest', authMiddleware.checkRoles(['USER', 'ADMIN']), EventController.showInterest);
router.delete('/:id/leave', authMiddleware.checkRoles(['USER', 'ADMIN']), EventController.leaveEvent);

// Quản lý người chơi (chỉ chủ sân creator)
router.post('/:id/players/:playerId/accept', authMiddleware.checkRoles(['STAFF', 'MANAGER', 'ADMIN']), EventController.acceptPlayer);
router.post('/:id/players/:playerId/reject', authMiddleware.checkRoles(['STAFF', 'MANAGER', 'ADMIN']), EventController.rejectPlayer);
router.delete('/:id/players/:playerId', authMiddleware.checkRoles(['STAFF', 'MANAGER', 'ADMIN']), EventController.removePlayer);

// Chuyển đổi thành booking (chỉ chủ sân)
router.post('/:id/convert-to-booking', authMiddleware.checkRoles(['STAFF', 'MANAGER', 'ADMIN']), EventController.convertToBooking);

// Kiểm tra và cập nhật status
router.get('/:id/check-status', EventController.checkEventStatus);

module.exports = router;