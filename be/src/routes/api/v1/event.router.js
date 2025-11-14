const express = require('express');
const router = express.Router();
const EventController = require('../../../controllers/event.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');

// Bảo vệ tất cả các routes với authentication
router.use(authenticate);

// Tìm kiếm và lọc event
router.get('/search', EventController.searchEvent);
router.get('/available', EventController.getAvailableEvent);
router.get('/my-events', EventController.getMyEvent);

// Quản lý event
router.post('/', EventController.createEvent);
router.get('/:id', EventController.getEventById);
router.put('/:id', EventController.updateEvent);
router.delete('/:id', EventController.deleteEvent);

// Xử lý người tham gia
router.post('/:id/interest', EventController.showInterest);
router.delete('/:id/leave', EventController.leaveEvent);

// Quản lý người chơi (chỉ creator)
router.post('/:id/players/:playerId/accept', EventController.acceptPlayer);
router.post('/:id/players/:playerId/reject', EventController.rejectPlayer);
router.delete('/:id/players/:playerId', EventController.removePlayer);

// Chuyển đổi thành booking
router.post('/:id/convert-to-booking', EventController.convertToBooking);

// Kiểm tra và cập nhật status
router.get('/:id/check-status', EventController.checkEventStatus);

module.exports = router;