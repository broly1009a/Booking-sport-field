const MatchmakingService = require('../services/matchmaking.service');

class MatchmakingController {
    async createMatchmaking(req, res, next) {
        try {
            const data = req.body;
            const matchmaking = await MatchmakingService.createMatchmaking(data);
            res.status(201).json({ success: true, data: matchmaking });
        } catch (error) {
            next(error);
        }
    }

    async getAllMatchmakings(req, res, next) {
        try {
            const matchmakings = await MatchmakingService.getAllMatchmakings();
            res.status(200).json({ success: true, data: matchmakings });
        } catch (error) {
            next(error);
        }
    }

    async getMatchmakingById(req, res, next) {
        try {
            const { id } = req.params;
            const matchmaking = await MatchmakingService.getMatchmakingById(id);
            if (!matchmaking) {
                return res.status(404).json({ success: false, message: 'Matchmaking not found' });
            }
            res.status(200).json({ success: true, data: matchmaking });
        } catch (error) {
            next(error);
        }
    }

    async updateMatchmaking(req, res, next) {
        try {
            const { id } = req.params;
            const data = req.body;
            const updated = await MatchmakingService.updateMatchmaking(id, data);
            if (!updated) {
                return res.status(404).json({ success: false, message: 'Matchmaking not found' });
            }
            res.status(200).json({ success: true, data: updated });
        } catch (error) {
            next(error);
        }
    }

    async deleteMatchmaking(req, res, next) {
        try {
            const { id } = req.params;
            const deleted = await MatchmakingService.deleteMatchmaking(id);
            if (!deleted) {
                return res.status(404).json({ success: false, message: 'Matchmaking not found' });
            }
            res.status(200).json({ success: true, message: 'Matchmaking deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
    async getOpenMatchmakings(req, res, next) {
        try {
            const matchmakings = await MatchmakingService.getOpenMatchmakings();
            res.status(200).json({ success: true, data: matchmakings });
        } catch (error) {
            next(error);
        }
    }
    async joinMatchmaking(req, res, next) {
    try {
        const { id } = req.params; // id của matchmaking
        const { representativeId } = req.body; // userId của người đại diện
        const result = await MatchmakingService.joinMatchmaking(id, representativeId);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}
async getMatchmakingsByUser(req, res, next) {
    try {
        const { userId } = req.params;
        const matchmakings = await MatchmakingService.getMatchmakingsByUser(userId);
        res.status(200).json({ success: true, data: matchmakings });
    } catch (error) {
        next(error);
    }
}
}

module.exports = new MatchmakingController();