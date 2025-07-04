const matchmakingModel = require('../models/matchmaking.model');
const { User } = require('../models');
const bookingModel = require('../models/booking.model');

class MatchmakingService {
    async createMatchmaking(data) {
        const { bookingId, userId, requiredPlayers, joinedPlayers = [] } = data;

        // Validate bookingId và userId
        const booking = await bookingModel.findById(bookingId);
        if (!booking) {
            throw { status: 404, message: 'Booking không tồn tại.' };
        }
        const user = await User.findById(userId);
        if (!user) {
            throw { status: 404, message: 'User không tồn tại.' };
        }

        // Không cho phép nhiều matchmaking cho cùng booking khi còn open/full
        const existing = await matchmakingModel.findOne({
            bookingId,
            status: { $in: ['open', 'full'] }
        });
        if (existing) {
            throw { status: 409, message: 'Đã có phòng ghép trận cho booking này.' };
        }

        // requiredPlayers phải > 0
        if (!requiredPlayers || requiredPlayers < 1) {
            throw { status: 400, message: 'Số lượng người chơi cần ghép phải lớn hơn 0.' };
        }

        // joinedPlayers không vượt quá requiredPlayers
        if (joinedPlayers.length > requiredPlayers) {
            throw { status: 400, message: 'Số người đã tham gia vượt quá số lượng cần ghép.' };
        }

        // Không cho phép userId trùng trong joinedPlayers
        if (joinedPlayers.includes(userId)) {
            throw { status: 400, message: 'Người tạo không thể nằm trong joinedPlayers.' };
        }

        // Nếu mọi thứ hợp lệ, tạo matchmaking
        const matchmaking = new matchmakingModel(data);
        return await matchmaking.save();
    }

    async getAllMatchmakings() {
        return await matchmakingModel.find()
            .populate('bookingId')
            .populate('userId')
            .populate('joinedPlayers');
    }

    async getMatchmakingById(id) {
        return await matchmakingModel.findById(id)
            .populate('bookingId')
            .populate('userId')
            .populate('joinedPlayers');
    }

    async updateMatchmaking(id, data) {
        return await matchmakingModel.findByIdAndUpdate(id, data, { new: true })
            .populate('bookingId')
            .populate('userId')
            .populate('joinedPlayers');
    }

    async deleteMatchmaking(id) {
        return await matchmakingModel.findByIdAndDelete(id);
    }
    async getOpenMatchmakings() {
        return await matchmakingModel.find({ status: 'open', representativeId: { $exists: false } })
            .populate({
                path: 'bookingId',
                populate: {
                    path: 'fieldId',
                    select: 'name type'
                }
            })
            .populate('userId');
    }
    async joinMatchmaking(matchmakingId, representativeId) {
        const matchmaking = await matchmakingModel.findById(matchmakingId);
        if (!matchmaking) throw { status: 404, message: 'Matchmaking không tồn tại.' };
        if (matchmaking.status !== 'open') throw { status: 400, message: 'Phòng đã đủ hoặc đã đóng.' };
        if (matchmaking.representativeId) throw { status: 400, message: 'Đã có người đại diện ghép.' };

        matchmaking.representativeId = representativeId;
        matchmaking.status = 'full';
        await matchmaking.save();

        // Lấy lại document đã populate đầy đủ
        return await matchmakingModel.findById(matchmakingId)
            .populate({
                path: 'bookingId',
                populate: {
                    path: 'fieldId',
                    select: 'name type'
                }
            })
            .populate('userId')
            .populate('representativeId');
    }
    async getMatchmakingsByUser(userId) {
        // Lấy tất cả phòng ghép trận mà user là người tạo hoặc đã tham gia
        return await matchmakingModel.find({
            $or: [
                { userId },
                { joinedPlayers: userId },
                { representativeId: userId }
            ]
        })
            .populate({
                path: 'bookingId',
                populate: { path: 'fieldId', select: 'name type' }
            })
            .populate('userId')
            .populate('joinedPlayers')
            .populate('representativeId')
            .sort({ createdAt: -1 });
    }
}

module.exports = new MatchmakingService();