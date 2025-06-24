const express = require('express');
const router = express.Router();
const MatchmakingController = require('../../../controllers/matchmaking.controller');

router.get('/', MatchmakingController.getAllMatchmakings);
router.get('/open', MatchmakingController.getOpenMatchmakings);
router.get('/user/:userId', MatchmakingController.getMatchmakingsByUser);
router.post('/:id/join', MatchmakingController.joinMatchmaking);
router.get('/:id', MatchmakingController.getMatchmakingById);
router.post('/', MatchmakingController.createMatchmaking);
router.put('/:id', MatchmakingController.updateMatchmaking);
router.delete('/:id', MatchmakingController.deleteMatchmaking);

module.exports = router;