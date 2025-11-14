const Event = require('../models/event.model');
const Booking = require('../models/booking.model');
const User = require('../models/user.model');
const SportField = require('../models/sportField.model');
const { ValidationError, NotFoundError } = require('../utils/errors');

class EventService {
    // Tìm kiếm event với bộ lọc
    async searchEvent(filters) {
        const query = { status: 'open' };

        if (filters.playerLevel && filters.playerLevel !== 'any') {
            query.playerLevel = { $in: [filters.playerLevel, 'any'] };
        }
        if (filters.playStyle && filters.playStyle !== 'any') {
            query.playStyle = { $in: [filters.playStyle, 'any'] };
        }
        if (filters.teamPreference) {
            query.teamPreference = filters.teamPreference;
        }
        if (filters.minSlots) {
            query.availableSlots = { $gte: parseInt(filters.minSlots) };
        }

        if (filters.startDate || filters.endDate) {
            query.startTime = {};
            if (filters.startDate) query.startTime.$gte = new Date(filters.startDate);
            if (filters.endDate) query.startTime.$lte = new Date(filters.endDate);
        }

        return await Event.find(query)
            .populate('createdBy', 'name email avatar')
            .populate('fieldId', 'name location price')
            .populate('interestedPlayers.userId', 'name email avatar')
            .sort({ startTime: 1 });
    }

    // Lấy các event đang mở và còn slot
    async getAvailableEvent() {
        return await Event.find({
            status: 'open',
            availableSlots: { $gt: 0 },
            deadline: { $gt: new Date() }
        })
        .populate('createdBy', 'name email avatar')
        .populate('fieldId', 'name location price')
        .populate('interestedPlayers.userId', 'name email avatar')
        .sort({ startTime: 1 });
    }

    // Lấy event của user (tạo hoặc tham gia)
    async getMyEvent(userId) {
        const created = await Event.find({ createdBy: userId })
            .populate('createdBy', 'name email avatar')
            .populate('fieldId', 'name location price')
            .populate('interestedPlayers.userId', 'name email avatar')
            .sort({ startTime: -1 });

        const participated = await Event.find({
            'interestedPlayers.userId': userId
        })
        .populate('createdBy', 'name email avatar')
        .populate('fieldId', 'name location price')
        .populate('interestedPlayers.userId', 'name email avatar')
        .sort({ startTime: -1 });

        return { created, participated };
    }

    // Tạo event matching mới
    async createEvent(data, userId) {
        // Validate thời gian
        const now = new Date();
        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);
        const deadline = data.deadline ? new Date(data.deadline) : new Date(startTime.getTime() - 2 * 60 * 60 * 1000); // 2h trước

        if (startTime <= now) {
            throw new ValidationError('Thời gian bắt đầu phải lớn hơn thời gian hiện tại');
        }

        if (endTime <= startTime) {
            throw new ValidationError('Thời gian kết thúc phải lớn hơn thời gian bắt đầu');
        }

        if (deadline >= startTime) {
            throw new ValidationError('Deadline phải trước thời gian bắt đầu');
        }

        // Validate số lượng người chơi
        const minPlayers = parseInt(data.minPlayers) || 4;
        const maxPlayers = parseInt(data.maxPlayers) || 8;

        if (minPlayers < 4 || minPlayers > 8) {
            throw new ValidationError('Số người tối thiểu phải từ 4 đến 8');
        }

        if (maxPlayers < 4 || maxPlayers > 8) {
            throw new ValidationError('Số người tối đa phải từ 4 đến 8');
        }

        if (maxPlayers < minPlayers) {
            throw new ValidationError('Số người tối đa phải lớn hơn hoặc bằng số người tối thiểu');
        }

        // Kiểm tra sân
        const field = await SportField.findById(data.fieldId);
        if (!field) {
            throw new NotFoundError('Không tìm thấy sân');
        }

        // Kiểm tra user đã có event đang mở chưa
        const existingOpenEvent = await Event.findOne({
            createdBy: userId,
            status: 'open',
            startTime: { $gt: now }
        });

        if (existingOpenEvent) {
            throw new ValidationError('Bạn đã có một event đang mở. Vui lòng hoàn thành hoặc hủy event đó trước khi tạo mới');
        }

        // Tính giá ước tính (giảm theo discountPercent, mặc định 20%)
        const discountPercent = data.discountPercent || 20;
        const duration = (endTime - startTime) / (1000 * 60 * 60); // giờ
        const estimatedPrice = field.price * duration * (1 - discountPercent / 100) / maxPlayers;

        // Tạo event mới
        const event = new Event({
            name: data.name,
            description: data.description,
            image: data.image,
            fieldId: data.fieldId,
            createdBy: userId,
            startTime,
            endTime,
            deadline,
            minPlayers,
            maxPlayers,
            availableSlots: maxPlayers - 1, // Trừ người tạo
            playerLevel: data.playerLevel || 'any',
            playStyle: data.playStyle || 'casual',
            teamPreference: data.teamPreference || 'random',
            status: 'open',
            discountPercent,
            estimatedPrice: Math.round(estimatedPrice),
            interestedPlayers: []
        });

        await event.save();
        return await event.populate(['createdBy', 'fieldId']);
    }

    // Lấy thông tin chi tiết event
    async getEventById(id) {
        const event = await Event.findById(id)
            .populate('createdBy', 'name email avatar phone')
            .populate('fieldId', 'name location price type')
            .populate('interestedPlayers.userId', 'name email avatar phone');

        if (!event) {
            throw new NotFoundError('Không tìm thấy event');
        }

        return event;
    }

    // Bày tỏ quan tâm tham gia event
    async showInterest(eventId, userId, note = '') {
        const event = await Event.findById(eventId);
        if (!event) {
            throw new NotFoundError('Không tìm thấy event');
        }

        // Kiểm tra trạng thái event
        if (event.status !== 'open') {
            throw new ValidationError('Event này không còn nhận người tham gia');
        }

        // Kiểm tra deadline
        if (new Date() > event.deadline) {
            throw new ValidationError('Đã hết hạn đăng ký event này');
        }

        // Không thể tham gia event của chính mình
        if (event.createdBy.toString() === userId.toString()) {
            throw new ValidationError('Bạn không thể tham gia event của chính mình');
        }

        // Kiểm tra đã quan tâm chưa
        const existingInterest = event.interestedPlayers.find(
            p => p.userId.toString() === userId.toString()
        );

        if (existingInterest) {
            if (existingInterest.status === 'pending') {
                throw new ValidationError('Bạn đã gửi yêu cầu tham gia event này');
            } else if (existingInterest.status === 'accepted') {
                throw new ValidationError('Bạn đã được chấp nhận vào event này');
            } else {
                throw new ValidationError('Yêu cầu của bạn đã bị từ chối trước đó');
            }
        }

        // Kiểm tra còn slot không
        if (event.availableSlots <= 0) {
            throw new ValidationError('Event đã đủ số lượng người tham gia');
        }

        // Thêm người quan tâm
        event.interestedPlayers.push({
            userId,
            status: 'pending',
            requestedAt: new Date(),
            note
        });

        await event.save();
        return await event.populate(['createdBy', 'fieldId', 'interestedPlayers.userId']);
    }

    // Cập nhật thông tin event
    async updateEvent(id, data, userId) {
        const event = await Event.findById(id);
        if (!event) {
            throw new NotFoundError('Không tìm thấy event');
        }

        if (event.createdBy.toString() !== userId.toString()) {
            throw new ValidationError('Bạn không có quyền cập nhật event này');
        }

        if (event.status !== 'open') {
            throw new ValidationError('Chỉ có thể cập nhật event đang mở');
        }

        // Các trường được phép cập nhật
        const allowedUpdates = [
            'name', 'description', 'image', 'playerLevel', 
            'playStyle', 'teamPreference', 'deadline', 
            'minPlayers', 'maxPlayers'
        ];

        const updates = {};
        allowedUpdates.forEach(field => {
            if (data[field] !== undefined) {
                updates[field] = data[field];
            }
        });

        // Validate nếu cập nhật số người
        if (updates.minPlayers || updates.maxPlayers) {
            const minPlayers = updates.minPlayers || event.minPlayers;
            const maxPlayers = updates.maxPlayers || event.maxPlayers;
            
            if (minPlayers < 4 || minPlayers > 8) {
                throw new ValidationError('Số người tối thiểu phải từ 4 đến 8');
            }
            if (maxPlayers < 4 || maxPlayers > 8) {
                throw new ValidationError('Số người tối đa phải từ 4 đến 8');
            }
            if (maxPlayers < minPlayers) {
                throw new ValidationError('Số người tối đa phải lớn hơn hoặc bằng số người tối thiểu');
            }

            // Cập nhật availableSlots
            const acceptedCount = event.interestedPlayers.filter(p => p.status === 'accepted').length;
            updates.availableSlots = maxPlayers - 1 - acceptedCount;
        }

        Object.assign(event, updates);
        await event.save();
        return await event.populate(['createdBy', 'fieldId', 'interestedPlayers.userId']);
    }

    // Xóa/Hủy event
    async deleteEvent(id, userId) {
        const event = await Event.findById(id);
        if (!event) {
            throw new NotFoundError('Không tìm thấy event');
        }

        if (event.createdBy.toString() !== userId.toString()) {
            throw new ValidationError('Bạn không có quyền xóa event này');
        }

        if (event.status === 'confirmed' || event.status === 'completed') {
            throw new ValidationError('Không thể hủy event đã xác nhận hoặc hoàn thành');
        }

        event.status = 'cancelled';
        await event.save();
        return { message: 'Đã hủy event thành công' };
    }

    // Chấp nhận người chơi
    async acceptPlayer(eventId, playerId, userId) {
        const event = await Event.findById(eventId);
        if (!event) {
            throw new NotFoundError('Không tìm thấy event');
        }

        if (event.createdBy.toString() !== userId.toString()) {
            throw new ValidationError('Chỉ người tạo mới có quyền chấp nhận người chơi');
        }

        if (event.status !== 'open') {
            throw new ValidationError('Event không còn ở trạng thái mở');
        }

        const playerInterest = event.interestedPlayers.find(
            p => p.userId.toString() === playerId
        );

        if (!playerInterest) {
            throw new NotFoundError('Không tìm thấy người chơi trong danh sách');
        }

        if (playerInterest.status === 'accepted') {
            throw new ValidationError('Người chơi đã được chấp nhận');
        }

        // Kiểm tra còn slot không
        if (event.availableSlots <= 0) {
            throw new ValidationError('Event đã đủ số lượng người tham gia');
        }

        playerInterest.status = 'accepted';
        event.availableSlots -= 1;

        // Kiểm tra nếu đã đủ số người tối đa thì chuyển sang full
        if (event.availableSlots === 0) {
            event.status = 'full';
        }

        await event.save();
        return await event.populate(['createdBy', 'fieldId', 'interestedPlayers.userId']);
    }

    // Từ chối người chơi
    async rejectPlayer(eventId, playerId, userId) {
        const event = await Event.findById(eventId);
        if (!event) {
            throw new NotFoundError('Không tìm thấy event');
        }

        if (event.createdBy.toString() !== userId.toString()) {
            throw new ValidationError('Chỉ người tạo mới có quyền từ chối người chơi');
        }

        const playerInterest = event.interestedPlayers.find(
            p => p.userId.toString() === playerId
        );

        if (!playerInterest) {
            throw new NotFoundError('Không tìm thấy người chơi trong danh sách');
        }

        if (playerInterest.status === 'rejected') {
            throw new ValidationError('Người chơi đã bị từ chối');
        }

        // Nếu người này đã accepted thì cần hoàn lại slot
        if (playerInterest.status === 'accepted') {
            event.availableSlots += 1;
            if (event.status === 'full') {
                event.status = 'open';
            }
        }

        playerInterest.status = 'rejected';
        await event.save();
        return await event.populate(['createdBy', 'fieldId', 'interestedPlayers.userId']);
    }

    // Xóa người chơi khỏi event
    async removePlayer(eventId, playerId, userId) {
        const event = await Event.findById(eventId);
        if (!event) {
            throw new NotFoundError('Không tìm thấy event');
        }

        if (event.createdBy.toString() !== userId.toString()) {
            throw new ValidationError('Chỉ người tạo mới có quyền xóa người chơi');
        }

        const playerIndex = event.interestedPlayers.findIndex(
            p => p.userId.toString() === playerId
        );

        if (playerIndex === -1) {
            throw new NotFoundError('Không tìm thấy người chơi trong danh sách');
        }

        const player = event.interestedPlayers[playerIndex];
        
        // Nếu người này đã accepted thì cần hoàn lại slot
        if (player.status === 'accepted') {
            event.availableSlots += 1;
            if (event.status === 'full') {
                event.status = 'open';
            }
        }

        event.interestedPlayers.splice(playerIndex, 1);
        await event.save();
        return await event.populate(['createdBy', 'fieldId', 'interestedPlayers.userId']);
    }

    // Chuyển đổi event thành booking
    async convertToBooking(eventId, userId) {
        const event = await Event.findById(eventId)
            .populate('createdBy')
            .populate('fieldId')
            .populate('interestedPlayers.userId');

        if (!event) {
            throw new NotFoundError('Không tìm thấy event');
        }

        if (event.createdBy._id.toString() !== userId.toString()) {
            throw new ValidationError('Chỉ người tạo mới có thể chuyển đổi thành booking');
        }

        if (event.status === 'cancelled') {
            throw new ValidationError('Không thể chuyển đổi event đã hủy');
        }

        if (event.bookingId) {
            throw new ValidationError('Event này đã được chuyển đổi thành booking');
        }

        // Lấy danh sách người chơi đã được chấp nhận
        const acceptedPlayers = event.interestedPlayers.filter(p => p.status === 'accepted');
        const totalPlayers = acceptedPlayers.length + 1; // +1 cho creator

        // Kiểm tra đủ số lượng tối thiểu chưa
        if (totalPlayers < event.minPlayers) {
            throw new ValidationError(
                `Chưa đủ số lượng người chơi tối thiểu (${totalPlayers}/${event.minPlayers})`
            );
        }

        // Tính toán giá cho mỗi người (đã giảm giá)
        const field = event.fieldId;
        const duration = (event.endTime - event.startTime) / (1000 * 60 * 60); // giờ
        const totalPrice = field.price * duration;
        const discountedPrice = totalPrice * (1 - event.discountPercent / 100);
        const pricePerPerson = Math.round(discountedPrice / totalPlayers);

        // Tạo danh sách participants
        const participants = [event.createdBy._id, ...acceptedPlayers.map(p => p.userId._id)];
        const participantDetails = participants.map(userId => ({
            userId,
            paymentStatus: 'pending',
            pricePerPerson
        }));

        // Tạo booking mới
        const booking = new Booking({
            fieldId: event.fieldId._id,
            startTime: event.startTime,
            endTime: event.endTime,
            bookingType: 'event-matching', // Loại đặc biệt cho matching
            userId: event.createdBy._id,
            status: 'confirmed', // Tự động confirmed vì đã có đủ người
            totalPrice: Math.round(discountedPrice),
            participants,
            participantDetails,
            maxParticipants: event.maxPlayers,
            customerName: event.createdBy.name || '',
            phoneNumber: event.createdBy.phone || '',
            notes: `Event matching: ${event.name}. Giảm ${event.discountPercent}%. Giá/người: ${pricePerPerson.toLocaleString()}đ`
        });

        await booking.save();

        // Cập nhật event
        event.bookingId = booking._id;
        event.status = 'confirmed';
        await event.save();

        return {
            event: await event.populate(['createdBy', 'fieldId', 'interestedPlayers.userId']),
            booking: await booking.populate(['fieldId', 'participants'])
        };
    }

    // Người chơi tự rời khỏi event (trước deadline)
    async leaveEvent(eventId, userId) {
        const event = await Event.findById(eventId);
        if (!event) {
            throw new NotFoundError('Không tìm thấy event');
        }

        // Không cho phép creator rời khỏi event
        if (event.createdBy.toString() === userId.toString()) {
            throw new ValidationError('Người tạo không thể rời khỏi event. Vui lòng hủy event nếu muốn');
        }

        // Tìm người chơi trong danh sách
        const playerIndex = event.interestedPlayers.findIndex(
            p => p.userId.toString() === userId.toString()
        );

        if (playerIndex === -1) {
            throw new NotFoundError('Bạn không có trong danh sách event này');
        }

        const player = event.interestedPlayers[playerIndex];

        // Không cho rời nếu event đã confirmed hoặc completed
        if (event.status === 'confirmed' || event.status === 'completed') {
            throw new ValidationError('Không thể rời khỏi event đã xác nhận hoặc hoàn thành');
        }

        // Kiểm tra deadline
        if (new Date() > event.deadline) {
            throw new ValidationError('Đã quá deadline để rời khỏi event');
        }

        // Nếu đã được accept thì hoàn lại slot
        if (player.status === 'accepted') {
            event.availableSlots += 1;
            if (event.status === 'full') {
                event.status = 'open';
            }
        }

        event.interestedPlayers.splice(playerIndex, 1);
        await event.save();

        return { message: 'Đã rời khỏi event thành công' };
    }

    // Kiểm tra tự động cập nhật status event
    async autoUpdateEventStatus(eventId) {
        const event = await Event.findById(eventId);
        if (!event) return;

        const now = new Date();

        // Tự động đóng nếu quá deadline
        if (event.status === 'open' && now > event.deadline) {
            const acceptedCount = event.interestedPlayers.filter(p => p.status === 'accepted').length + 1;
            
            if (acceptedCount >= event.minPlayers) {
                // Đủ người, chuyển sang confirmed
                event.status = 'confirmed';
            } else {
                // Không đủ người, hủy
                event.status = 'cancelled';
            }
            await event.save();
        }

        // Tự động chuyển sang completed nếu đã qua thời gian kết thúc
        if (event.status === 'confirmed' && now > event.endTime) {
            event.status = 'completed';
            await event.save();
        }

        return event;
    }
}

module.exports = new EventService();