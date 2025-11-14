const express = require('express');
const router = express.Router();
const MatchmakingController = require('../../../controllers/matchmaking.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');

// Bảo vệ tất cả các routes với authentication
router.use(authenticate);

// Tìm kiếm và lọc matchmaking
router.get('/search', MatchmakingController.searchMatchmaking);
router.get('/available', MatchmakingController.getAvailableMatchmaking);
router.get('/my-matchmaking', MatchmakingController.getMyMatchmaking);

// Quản lý matchmaking
router.post('/', MatchmakingController.createMatchmaking);
router.get('/:id', MatchmakingController.getMatchmakingById);
router.put('/:id', MatchmakingController.updateMatchmaking);
router.delete('/:id', MatchmakingController.deleteMatchmaking);

// Xử lý người tham gia
router.post('/:id/interest', MatchmakingController.showInterest);
router.post('/:id/players/:playerId/accept', MatchmakingController.acceptPlayer);
router.post('/:id/players/:playerId/reject', MatchmakingController.rejectPlayer);
router.delete('/:id/players/:playerId', MatchmakingController.removePlayer);

// Xử lý booking
router.post('/:id/convert-to-booking', MatchmakingController.convertToBooking);

module.exports = router;