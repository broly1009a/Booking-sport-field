const Matchmaking = require('../models/matchmaking.model');
const Booking = require('../models/booking.model');
const User = require('../models/user.model');
const SportField = require('../models/sportField.model');
const { ValidationError, NotFoundError } = require('../utils/errors');

class MatchmakingService {
    async searchMatchmaking(filters) {
        const query = { status: 'open' };

        if (filters.playerLevel) query.playerLevel = filters.playerLevel;
        if (filters.playStyle) query.playStyle = filters.playStyle;
        if (filters.teamPreference) query.teamPreference = filters.teamPreference;
        if (filters.availableSlots) query.availableSlots = { $gte: parseInt(filters.availableSlots) };

        if (filters.startDate || filters.endDate) {
            query.startTime = {};
            if (filters.startDate) query.startTime.$gte = new Date(filters.startDate);
            if (filters.endDate) query.startTime.$lte = new Date(filters.endDate);
        }

        return await Matchmaking.find(query)
            .populate('createdBy', 'name email')
            .populate('fieldId', 'name location')
            .populate('interestedPlayers.userId', 'name email')
            .sort({ startTime: 1 });
    }

    async getAvailableMatchmaking() {
        return await Matchmaking.find({
            status: 'open',
            availableSlots: { $gt: 0 },
            deadline: { $gt: new Date() }
        })
        .populate('createdBy', 'name email')
        .populate('fieldId', 'name location')
        .populate('interestedPlayers.userId', 'name email')
        .sort({ startTime: 1 });
    }

    async getMyMatchmaking(userId) {
        const created = await Matchmaking.find({ createdBy: userId })
            .populate('createdBy', 'name email')
            .populate('fieldId', 'name location')
            .populate('interestedPlayers.userId', 'name email');

        const participated = await Matchmaking.find({
            'interestedPlayers.userId': userId
        })
        .populate('createdBy', 'name email')
        .populate('fieldId', 'name location')
        .populate('interestedPlayers.userId', 'name email');

        return { created, participated };
    }

    async createMatchmaking(data, userId) {
        // Validate thời gian
        if (new Date(data.startTime) <= new Date()) {
            throw new ValidationError('Thời gian bắt đầu phải lớn hơn thời gian hiện tại');
        }

        if (new Date(data.endTime) <= new Date(data.startTime)) {
            throw new ValidationError('Thời gian kết thúc phải lớn hơn thời gian bắt đầu');
        }

        // Kiểm tra sân
        const field = await SportField.findById(data.fieldId);
        if (!field) {
            throw new NotFoundError('Không tìm thấy sân');
        }

        // Kiểm tra xem có matchmaking nào đang mở của user không
        const existingMatchmaking = await Matchmaking.findOne({
            createdBy: userId,
            status: 'open'
        });

        if (existingMatchmaking) {
            throw new ValidationError('Bạn đã có một yêu cầu matchmaking đang mở');
        }

        // Tạo matchmaking mới
        const matchmaking = new Matchmaking({
            ...data,
            createdBy: userId,
            status: 'open',
            deadline: data.deadline || new Date(data.startTime),
            interestedPlayers: []
        });

        return await matchmaking.save();
    }

    async getMatchmakingById(id) {
        const matchmaking = await Matchmaking.findById(id)
            .populate('createdBy', 'name email')
            .populate('fieldId', 'name location')
            .populate('interestedPlayers.userId', 'name email');

        if (!matchmaking) {
            throw new NotFoundError('Không tìm thấy matchmaking');
        }

        return matchmaking;
    }

    async showInterest(matchmakingId, userId) {
        const matchmaking = await Matchmaking.findById(matchmakingId);
        if (!matchmaking) {
            throw new NotFoundError('Không tìm thấy matchmaking');
        }

        if (matchmaking.status !== 'open') {
            throw new ValidationError('Matchmaking này không còn nhận người tham gia');
        }

        if (matchmaking.createdBy.toString() === userId.toString()) {
            throw new ValidationError('Bạn không thể tham gia matchmaking của chính mình');
        }

        // Kiểm tra xem đã quan tâm chưa
        const existingInterest = matchmaking.interestedPlayers.find(
            p => p.userId.toString() === userId.toString()
        );

        if (existingInterest) {
            throw new ValidationError('Bạn đã bày tỏ quan tâm với matchmaking này');
        }

        matchmaking.interestedPlayers.push({
            userId,
            status: 'pending',
            requestedAt: new Date()
        });

        await matchmaking.save();
        return await matchmaking.populate(['createdBy', 'fieldId', 'interestedPlayers.userId']);
    }

    async updateMatchmaking(id, data, userId) {
        const matchmaking = await Matchmaking.findById(id);
        if (!matchmaking) {
            throw new NotFoundError('Không tìm thấy matchmaking');
        }

        if (matchmaking.createdBy.toString() !== userId.toString()) {
            throw new ValidationError('Bạn không có quyền cập nhật matchmaking này');
        }

        // Chỉ cho phép cập nhật một số trường nhất định
        const allowedUpdates = ['playerLevel', 'playStyle', 'teamPreference', 'description', 'deadline'];
        const updates = Object.keys(data)
            .filter(key => allowedUpdates.includes(key))
            .reduce((obj, key) => {
                obj[key] = data[key];
                return obj;
            }, {});

        Object.assign(matchmaking, updates);
        await matchmaking.save();
        return await matchmaking.populate(['createdBy', 'fieldId', 'interestedPlayers.userId']);
    }

    async deleteMatchmaking(id, userId) {
        const matchmaking = await Matchmaking.findById(id);
        if (!matchmaking) {
            throw new NotFoundError('Không tìm thấy matchmaking');
        }

        if (matchmaking.createdBy.toString() !== userId.toString()) {
            throw new ValidationError('Bạn không có quyền xóa matchmaking này');
        }

        matchmaking.status = 'cancelled';
        await matchmaking.save();
        return { message: 'Đã hủy matchmaking thành công' };
    }

    async acceptPlayer(matchmakingId, playerId, userId) {
        const matchmaking = await Matchmaking.findById(matchmakingId);
        if (!matchmaking) {
            throw new NotFoundError('Không tìm thấy matchmaking');
        }

        if (matchmaking.createdBy.toString() !== userId.toString()) {
            throw new ValidationError('Bạn không có quyền chấp nhận người chơi');
        }

        const playerInterest = matchmaking.interestedPlayers.find(
            p => p.userId.toString() === playerId
        );

        if (!playerInterest) {
            throw new NotFoundError('Không tìm thấy người chơi trong danh sách quan tâm');
        }

        playerInterest.status = 'accepted';

        // Kiểm tra số lượng người chấp nhận
        const acceptedPlayers = matchmaking.interestedPlayers.filter(p => p.status === 'accepted');
        if (acceptedPlayers.length >= matchmaking.availableSlots) {
            matchmaking.status = 'full';
        }

        await matchmaking.save();
        return await matchmaking.populate(['createdBy', 'fieldId', 'interestedPlayers.userId']);
    }

    async rejectPlayer(matchmakingId, playerId, userId) {
        const matchmaking = await Matchmaking.findById(matchmakingId);
        if (!matchmaking) {
            throw new NotFoundError('Không tìm thấy matchmaking');
        }

        if (matchmaking.createdBy.toString() !== userId.toString()) {
            throw new ValidationError('Bạn không có quyền từ chối người chơi');
        }

        const playerInterest = matchmaking.interestedPlayers.find(
            p => p.userId.toString() === playerId
        );

        if (!playerInterest) {
            throw new NotFoundError('Không tìm thấy người chơi trong danh sách quan tâm');
        }

        playerInterest.status = 'rejected';
        await matchmaking.save();
        return await matchmaking.populate(['createdBy', 'fieldId', 'interestedPlayers.userId']);
    }

    async removePlayer(matchmakingId, playerId, userId) {
        const matchmaking = await Matchmaking.findById(matchmakingId);
        if (!matchmaking) {
            throw new NotFoundError('Không tìm thấy matchmaking');
        }

        if (matchmaking.createdBy.toString() !== userId.toString()) {
            throw new ValidationError('Bạn không có quyền xóa người chơi');
        }

        matchmaking.interestedPlayers = matchmaking.interestedPlayers.filter(
            p => p.userId.toString() !== playerId
        );

        if (matchmaking.status === 'full') {
            matchmaking.status = 'open';
        }

        await matchmaking.save();
        return await matchmaking.populate(['createdBy', 'fieldId', 'interestedPlayers.userId']);
    }
    async convertToBooking(matchmakingId, userId) {
        const matchmaking = await Matchmaking.findById(matchmakingId)
            .populate('interestedPlayers.userId');

        if (!matchmaking) {
            throw new NotFoundError('Không tìm thấy matchmaking');
        }

        if (matchmaking.createdBy.toString() !== userId.toString()) {
            throw new ValidationError('Chỉ người tạo mới có thể chuyển đổi thành booking');
        }

        const acceptedPlayers = matchmaking.interestedPlayers.filter(p => p.status === 'accepted');
        if (acceptedPlayers.length < matchmaking.availableSlots - 1) {
            throw new ValidationError('Chưa đủ số lượng người chơi để tạo booking');
        }

        // Tạo booking mới
        const booking = new Booking({
            fieldId: matchmaking.fieldId,
            startTime: matchmaking.startTime,
            endTime: matchmaking.endTime,
            bookingType: 'shared',
            userId: matchmaking.createdBy,
            status: 'pending',
            participants: [matchmaking.createdBy, ...acceptedPlayers.map(p => p.userId._id)],
            participantDetails: [
                {
                    userId: matchmaking.createdBy,
                    paymentStatus: 'pending'
                },
                ...acceptedPlayers.map(p => ({
                    userId: p.userId._id,
                    paymentStatus: 'pending'
                }))
            ],
            maxParticipants: matchmaking.availableSlots,
            totalPrice: 0, // Sẽ được tính toán sau dựa trên giá sân
            customerName: matchmaking.createdBy.name || '',
            phoneNumber: matchmaking.createdBy.phone || '',
            joinDeadline: new Date(matchmaking.startTime)
        });

        await booking.save();

        // Cập nhật trạng thái matchmaking
        matchmaking.status = 'completed';
        await matchmaking.save();

        return {
            matchmaking: await matchmaking.populate(['createdBy', 'fieldId', 'interestedPlayers.userId']),
            booking
        };
    }
    async joinMatchmaking(matchmakingId, representativeId) {
        const matchmaking = await Matchmaking.findById(matchmakingId);
        if (!matchmaking) throw { status: 404, message: 'Matchmaking không tồn tại.' };
        if (matchmaking.status !== 'open') throw { status: 400, message: 'Phòng đã đủ hoặc đã đóng.' };
        if (matchmaking.representativeId) throw { status: 400, message: 'Đã có người đại diện ghép.' };

        matchmaking.representativeId = representativeId;
        matchmaking.status = 'full';
        await matchmaking.save();

        // Lấy lại document đã populate đầy đủ
        return await Matchmaking.findById(matchmakingId)
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
        return await Matchmaking.find({
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