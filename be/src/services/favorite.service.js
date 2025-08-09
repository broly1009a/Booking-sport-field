const Favorite = require('../models/favorite.model');
const SportField = require('../models/sportField.model');

class FavoriteService {
    async toggleFavorite(userId, fieldId) {
        const existing = await Favorite.findOne({ userId, fieldId });
        if (existing) {
            // Nếu đã tồn tại => hủy yêu thích
            await Favorite.deleteOne({ _id: existing._id });
            return { favorited: false };
        } else {
            // Kiểm tra sân có tồn tại không
            const field = await SportField.findById(fieldId);
            if (!field) {
                throw { status: 404, message: 'Sân không tồn tại.' };
            }

            // Nếu chưa tồn tại => thêm yêu thích
            await new Favorite({ userId, fieldId }).save();
            return { favorited: true };
        }
    }

    async getFavoritesByUser(userId) {
        return await Favorite.find({ userId })
            .populate({ path: 'fieldId', select: 'name location type capacity status pricePerHour imageUrl' })
            .sort({ createdAt: -1 });
    }
}

module.exports = new FavoriteService();
