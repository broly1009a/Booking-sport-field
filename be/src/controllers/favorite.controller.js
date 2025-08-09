const FavoriteService = require('../services/favorite.service');

class FavoriteController {
    async toggleFavorite(req, res, next) {
        try {
            const userId = req.body.userId || req.query.userId || req.params.userId;
            const { fieldId } = req.body;

            const result = await FavoriteService.toggleFavorite(userId, fieldId);
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    async getFavorites(req, res, next) {
        try {
            const userId = req.query.userId || req.body.userId || req.params.userId;

            if (!userId) {
                return res.status(400).json({ success: false, message: 'Missing userId' });
            }

            const favorites = await FavoriteService.getFavoritesByUser(userId);
            res.status(200).json({ success: true, data: favorites });
        } catch (error) {
            console.error('GetFavorites Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }

    }
}
module.exports = new FavoriteController();
