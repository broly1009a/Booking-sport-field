const Event = require('../models/event.model');
const Booking = require('../models/booking.model');
const User = require('../models/user.model');
const SportField = require('../models/sportField.model');
const Schedule = require('../models/schedule.model');

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

        const events = await Event.find(query)
            .populate('createdBy', 'name email avatar')
            .populate('fieldId', 'name location pricePerHour')
            .populate('interestedPlayers.userId', 'name email avatar')
            .sort({ startTime: 1 });

        return {
            success: true,
            status: 200,
            message: `Tìm thấy ${events.length} event`,
            data: events
        };
    }

    // Lấy các event đang mở và còn slot
    async getAvailableEvent() {
        const events = await Event.find({
            status: 'open',
            availableSlots: { $gt: 0 },
            deadline: { $gt: new Date() }
        })
        .populate('createdBy', 'name email avatar')
        .populate('fieldId', 'name location pricePerHour')
        .populate('interestedPlayers.userId', 'name email avatar')
        .sort({ startTime: 1 });

        return {
            success: true,
            status: 200,
            message: `Có ${events.length} event đang mở`,
            data: events
        };
    }

    // Lấy event của user (tạo hoặc tham gia)
    async getMyEvent(userId) {
        const created = await Event.find({ createdBy: userId })
            .populate('createdBy', 'name email avatar')
            .populate('fieldId', 'name location pricePerHour')
            .populate('interestedPlayers.userId', 'name email avatar')
            .sort({ startTime: -1 });

        const participated = await Event.find({
            'interestedPlayers.userId': userId
        })
        .populate('createdBy', 'name email avatar')
        .populate('fieldId', 'name location pricePerHour')
        .populate('interestedPlayers.userId', 'name email avatar')
        .sort({ startTime: -1 });

        return {
            success: true,
            status: 200,
            message: 'Lấy danh sách event thành công',
            data: { created, participated }
        };
    }

    // Tạo event matching mới
    async createEvent(data, userId) {
        // Validate thời gian
          const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);
        const deadline = data.deadline ? new Date(data.deadline) : new Date(startTime.getTime() - 2 * 60 * 60 * 1000); // 2h trước
        console.log('deadline:', deadline);
        console.log('now:', now);
        if (startTime <= now) {
            throw { status: 400, message: 'Thời gian bắt đầu phải lớn hơn thời gian hiện tại' };
        }

        if (endTime <= startTime) {
            throw { status: 400, message: 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu' };
        }

        if (deadline >= startTime) {
            throw { status: 400, message: 'Deadline phải trước thời gian bắt đầu' };
        }

        if (deadline <= now) {
            throw { status: 400, message: 'Deadline phải sau thời gian hiện tại' };
        }

        // Validate số lượng người chơi
        const minPlayers = parseInt(data.minPlayers) || 4;
        const maxPlayers = parseInt(data.maxPlayers) || 8;

        if (minPlayers < 4 || minPlayers > 8) {
            throw { status: 400, message: 'Số người tối thiểu phải từ 4 đến 8' };
        }

        if (maxPlayers < 4 || maxPlayers > 8) {
            throw { status: 400, message: 'Số người tối đa phải từ 4 đến 8' };
        }

        if (maxPlayers < minPlayers) {
            throw { status: 400, message: 'Số người tối đa phải lớn hơn hoặc bằng số người tối thiểu' };
        }

        // Kiểm tra sân
        const field = await SportField.findById(data.fieldId);
        if (!field) {
            throw { status: 404, message: 'Không tìm thấy sân' };
        }

        // Kiểm tra giá sân
        const fieldPrice = field.pricePerHour || field.price;
        if (!fieldPrice || isNaN(fieldPrice) || fieldPrice <= 0) {
            throw { status: 400, message: 'Sân chưa được cập nhật giá hoặc giá không hợp lệ' };
        }

        // Kiểm tra user đã có event đang mở chưa
        // const existingOpenEvent = await Event.findOne({
        //     createdBy: userId,
        //     status: 'open',
        //     startTime: { $gt: now }
        // });

        // if (existingOpenEvent) {
        //     throw { status: 400, message: 'Bạn đã có một event đang mở. Vui lòng hoàn thành hoặc hủy event đó trước khi tạo mới' };
        // }

        // Tính giá ước tính (linh hoạt: nếu truyền estimatedPrice thì tính discountPercent, ngược lại nếu truyền discountPercent thì tính estimatedPrice, mặc định 20%)
        const duration = (endTime - startTime) / (1000 * 60 * 60); // giờ
        let discountPercent, estimatedPrice;

        if (data.estimatedPrice !== undefined && data.discountPercent !== undefined) {
            throw { status: 400, message: 'Không thể truyền cả estimatedPrice và discountPercent cùng lúc' };
        } else if (data.estimatedPrice !== undefined) {
            estimatedPrice = data.estimatedPrice;
            discountPercent = 100 * (1 - (estimatedPrice * maxPlayers) / (fieldPrice * duration));
            if (discountPercent < 0 || discountPercent > 100) {
                throw { status: 400, message: 'Giá ước tính không hợp lệ, dẫn đến tỷ lệ giảm giá không hợp lệ (0-100%)' };
            }
        } else if (data.discountPercent !== undefined) {
            discountPercent = data.discountPercent;
            estimatedPrice = fieldPrice * duration * (1 - discountPercent / 100) / maxPlayers;
        } else {
            discountPercent = 20;
            estimatedPrice = fieldPrice * duration * (1 - discountPercent / 100) / maxPlayers;
        }

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
            availableSlots: maxPlayers, // Chủ sân không tham gia chơi
            playerLevel: data.playerLevel || 'any',
            playStyle: data.playStyle || 'casual',
            teamPreference: data.teamPreference || 'random',
            status: 'open',
            discountPercent,
            estimatedPrice: Math.round(estimatedPrice),
            interestedPlayers: []
        });
         // Kiểm tra trùng lịch sự kiện
            const overlappingEvent = await Event.findOne({
                fieldId: data.fieldId,
                $or: [
                    {
                        startTime: { $lt: endTime },
                        endTime: { $gt: startTime }
                    }
                ]
            });
        if (overlappingEvent) {
            throw { status: 400, message: 'Lịch sự kiện trùng với một sự kiện đã tồn tại' };
        }
        await event.save();
        const populatedEvent = await event.populate(['createdBy', 'fieldId']);
        
        // Cập nhật trạng thái schedule
         const bookingDate = new Date(startTime);
        const scheduleDate = new Date(Date.UTC(
            bookingDate.getUTCFullYear(),
            bookingDate.getUTCMonth(),
            bookingDate.getUTCDate(),
            0, 0, 0, 0
        ));
        
        console.log('Đang cập nhật schedule cho event:', {
            fieldId: data.fieldId,
            scheduleDate,
            startTime,
            endTime
        });
        
        const schedule = await Schedule.findOne({ fieldId: data.fieldId, date: scheduleDate });
        if (schedule) {
            console.log('Tìm thấy schedule, đang cập nhật time slots...');
            let updated = false;
            const start = startTime.getTime();
            const end = endTime.getTime();
            
            for (const slot of schedule.timeSlots) {
                if (
                    slot.startTime < end &&
                    slot.endTime > start
                ) {
                    console.log('Cập nhật slot thành event:', {
                        slotStart: new Date(slot.startTime),
                        slotEnd: new Date(slot.endTime),
                        oldStatus: slot.status,
                        newStatus: 'event'
                    });
                    slot.status = 'event';
                    updated = true;
                }
            }
            if (updated) {
                await schedule.save();
                console.log('Đã lưu schedule với status event');
            } else {
                console.log('Không có slot nào được cập nhật');
            }
        } else {
            console.error('Không tìm thấy schedule cho fieldId và date này');
            throw { status: 404, message: 'Không tìm thấy schedule cho sân và ngày này. Vui lòng tạo schedule trước.' };
        }
        
        return {
            success: true,
            status: 201,
            message: 'Tạo event thành công',
            data: populatedEvent
        };
    }

    // Lấy thông tin chi tiết event
    async getEventById(id) {
        const event = await Event.findById(id)
            .populate('createdBy', 'name email avatar phone')
            .populate('fieldId', 'name location pricePerHour type')
            .populate('interestedPlayers.userId', 'name email avatar phone');

        if (!event) {
            throw { status: 404, message: 'Không tìm thấy event' };
        }

        return {
            success: true,
            status: 200,
            message: 'Lấy thông tin event thành công',
            data: event
        };
    }

    // Bày tỏ quan tâm tham gia event
    async showInterest(eventId, userId, note = '') {
        const event = await Event.findById(eventId);
        if (!event) {
            throw { status: 404, message: 'Không tìm thấy event' };
        }

        // Kiểm tra trạng thái event
        if (event.status !== 'open') {
            throw { status: 400, message: 'Event này không còn nhận người tham gia' };
        }

        // Kiểm tra deadline
        if (new Date() > event.deadline) {
            throw { status: 400, message: 'Đã hết hạn đăng ký event này' };
        }

        // Kiểm tra đã tham gia chưa
        const existingInterest = event.interestedPlayers.find(
            p => p.userId.toString() === userId.toString()
        );

        if (existingInterest) {
            if (existingInterest.status === 'pending') {
                throw { status: 400, message: 'Bạn đã gửi yêu cầu tham gia event này' };
            } else if (existingInterest.status === 'accepted') {
                throw { status: 400, message: 'Bạn đã được chấp nhận vào event này' };
            } else {
                throw { status: 400, message: 'Yêu cầu của bạn đã bị từ chối trước đó' };
            }
        }

        // Kiểm tra còn slot không
        if (event.availableSlots <= 0) {
            throw { status: 400, message: 'Event đã đủ số lượng người tham gia' };
        }

        // ✨ Kiểm tra xung đột thời gian trước khi tham gia
        const hasConflict = await this.checkTimeConflict(userId, event.startTime, event.endTime);
        if (hasConflict) {
            throw { 
                status: 400, 
                message: 'Bạn đã có lịch đặt sân hoặc event khác trùng thời gian. Vui lòng kiểm tra lại lịch của bạn!' 
            };
        }

        // Thêm người quan tâm
        event.interestedPlayers.push({
            userId,
            status: 'pending',
            requestedAt: new Date(),
            note
        });

        await event.save();
        const populatedEvent = await event.populate(['createdBy', 'fieldId', 'interestedPlayers.userId']);
        
        return {
            success: true,
            status: 200,
            message: 'Đã gửi yêu cầu tham gia event',
            data: populatedEvent
        };
    }

    // Cập nhật thông tin event
    async updateEvent(id, data, userId) {
        const event = await Event.findById(id);
        if (!event) {
            throw { status: 404, message: 'Không tìm thấy event' };
        }

        if (event.createdBy.toString() !== userId.toString()) {
            throw { status: 403, message: 'Bạn không có quyền cập nhật event này' };
        }

        if (event.status !== 'open') {
            throw { status: 400, message: 'Chỉ có thể cập nhật event đang mở' };
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
                throw { status: 400, message: 'Số người tối thiểu phải từ 4 đến 8' };
            }
            if (maxPlayers < 4 || maxPlayers > 8) {
                throw { status: 400, message: 'Số người tối đa phải từ 4 đến 8' };
            }
            if (maxPlayers < minPlayers) {
                throw { status: 400, message: 'Số người tối đa phải lớn hơn hoặc bằng số người tối thiểu' };
            }

            // Cập nhật availableSlots
            const acceptedCount = event.interestedPlayers.filter(p => p.status === 'accepted').length;
            updates.availableSlots = maxPlayers - 1 - acceptedCount;
        }

        Object.assign(event, updates);
        await event.save();
        const populatedEvent = await event.populate(['createdBy', 'fieldId', 'interestedPlayers.userId']);
        
        return {
            success: true,
            status: 200,
            message: 'Cập nhật event thành công',
            data: populatedEvent
        };
    }

    // Xóa/Hủy event
    async deleteEvent(id, userId) {
        const event = await Event.findById(id);
        if (!event) {
            throw { status: 404, message: 'Không tìm thấy event' };
        }

        if (event.createdBy.toString() !== userId.toString()) {
            throw { status: 403, message: 'Bạn không có quyền xóa event này' };
        }

        if (event.status === 'confirmed' || event.status === 'completed') {
            throw { status: 400, message: 'Không thể hủy event đã xác nhận hoặc hoàn thành' };
        }

        event.status = 'cancelled';
        await event.save();
        
        return {
            success: true,
            status: 200,
            message: 'Đã hủy event thành công',
            data: null
        };
    }

    // Chấp nhận người chơi
    async acceptPlayer(eventId, playerId, userId) {
        const event = await Event.findById(eventId);
        if (!event) {
            throw { status: 404, message: 'Không tìm thấy event' };
        }

        if (event.createdBy.toString() !== userId.toString()) {
            throw { status: 403, message: 'Chỉ người tạo mới có quyền chấp nhận người chơi' };
        }

        if (event.status !== 'open') {
            throw { status: 400, message: 'Event không còn ở trạng thái mở' };
        }

        const playerInterest = event.interestedPlayers.find(
            p => p.userId.toString() === playerId
        );

        if (!playerInterest) {
            throw { status: 404, message: 'Không tìm thấy người chơi trong danh sách' };
        }

        if (playerInterest.status === 'accepted') {
            throw { status: 400, message: 'Người chơi đã được chấp nhận' };
        }

        // Kiểm tra còn slot không
        if (event.availableSlots <= 0) {
            throw { status: 400, message: 'Event đã đủ số lượng người tham gia' };
        }

        playerInterest.status = 'accepted';
        event.availableSlots -= 1;

        // Kiểm tra nếu đã đủ số người tối đa thì chuyển sang full
        if (event.availableSlots === 0) {
            event.status = 'full';
        }

        await event.save();
        const populatedEvent = await event.populate(['createdBy', 'fieldId', 'interestedPlayers.userId']);
        
        return {
            success: true,
            status: 200,
            message: 'Đã chấp nhận người chơi',
            data: populatedEvent
        };
    }

    // Từ chối người chơi
    async rejectPlayer(eventId, playerId, userId) {
        const event = await Event.findById(eventId);
        if (!event) {
            throw { status: 404, message: 'Không tìm thấy event' };
        }

        if (event.createdBy.toString() !== userId.toString()) {
            throw { status: 403, message: 'Chỉ người tạo mới có quyền từ chối người chơi' };
        }

        const playerInterest = event.interestedPlayers.find(
            p => p.userId.toString() === playerId
        );

        if (!playerInterest) {
            throw { status: 404, message: 'Không tìm thấy người chơi trong danh sách' };
        }

        if (playerInterest.status === 'rejected') {
            throw { status: 400, message: 'Người chơi đã bị từ chối' };
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
        const populatedEvent = await event.populate(['createdBy', 'fieldId', 'interestedPlayers.userId']);
        
        return {
            success: true,
            status: 200,
            message: 'Đã từ chối người chơi',
            data: populatedEvent
        };
    }

    // Xóa người chơi khỏi event
    async removePlayer(eventId, playerId, userId) {
        const event = await Event.findById(eventId);
        if (!event) {
            throw { status: 404, message: 'Không tìm thấy event' };
        }

        if (event.createdBy.toString() !== userId.toString()) {
            throw { status: 403, message: 'Chỉ người tạo mới có quyền xóa người chơi' };
        }

        const playerIndex = event.interestedPlayers.findIndex(
            p => p.userId.toString() === playerId
        );

        if (playerIndex === -1) {
            throw { status: 404, message: 'Không tìm thấy người chơi trong danh sách' };
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
        const populatedEvent = await event.populate(['createdBy', 'fieldId', 'interestedPlayers.userId']);
        
        return {
            success: true,
            status: 200,
            message: 'Đã xóa người chơi khỏi event',
            data: populatedEvent
        };
    }

    // Chuyển đổi event thành booking
    async convertToBooking(eventId, userId) {
        const event = await Event.findById(eventId)
            .populate('createdBy')
            .populate('fieldId')
            .populate('interestedPlayers.userId');

        if (!event) {
            throw { status: 404, message: 'Không tìm thấy event' };
        }

        if (event.createdBy._id.toString() !== userId.toString()) {
            throw { status: 403, message: 'Chỉ người tạo mới có thể chuyển đổi thành booking' };
        }

        if (event.status === 'cancelled') {
            throw { status: 400, message: 'Không thể chuyển đổi event đã hủy' };
        }

        if (event.bookingId) {
            throw { status: 400, message: 'Event này đã được chuyển đổi thành booking' };
        }

        // Lấy danh sách người chơi đã được chấp nhận (chủ sân không tham gia)
        const acceptedPlayers = event.interestedPlayers.filter(p => p.status === 'accepted');
        const totalPlayers = acceptedPlayers.length; // Chỉ tính người chơi

        // Kiểm tra đủ số lượng tối thiểu chưa
        if (totalPlayers < event.minPlayers) {
            throw { status: 400, message: `Chưa đủ số lượng người chơi tối thiểu (${totalPlayers}/${event.minPlayers})` };
        }

        // Tính toán giá cho mỗi người (đã giảm giá)
        const field = event.fieldId;
        const duration = (event.endTime - event.startTime) / (1000 * 60 * 60); // giờ
        const fieldPrice = field.pricePerHour || field.price;
        const totalPrice = fieldPrice * duration;
        const discountedPrice = totalPrice * (1 - event.discountPercent / 100);
        const pricePerPerson = Math.round(discountedPrice / participants.length);

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
            totalPrice: Math.round(pricePerPerson * participants.length),
            participants,
            participantDetails,
            maxParticipants: event.maxPlayers,
            customerName: `${event.createdBy.fname} ${event.createdBy.lname}` || 'Người dùng không tên',
            phoneNumber: event.createdBy.phoneNumber || 'Chưa cập nhật',
            notes: `Event matching: ${event.name}. Giảm ${event.discountPercent}%. Giá/người: ${pricePerPerson.toLocaleString()}đ`
        });

        await booking.save();

        // Cập nhật event
        event.bookingId = booking._id;
        event.status = 'confirmed';
        await event.save();

        const populatedEvent = await event.populate(['createdBy', 'fieldId', 'interestedPlayers.userId']);
        const populatedBooking = await booking.populate(['fieldId', 'participants']);
        
        return {
            success: true,
            status: 201,
            message: 'Đã chuyển đổi event thành booking thành công',
            data: {
                event: populatedEvent,
                booking: populatedBooking
            }
        };
    }

    // Người chơi tự rời khỏi event (trước deadline)
    async leaveEvent(eventId, userId) {
        const event = await Event.findById(eventId);
        if (!event) {
            throw { status: 404, message: 'Không tìm thấy event' };
        }

        // Tìm người chơi trong danh sách
        const playerIndex = event.interestedPlayers.findIndex(
            p => p.userId.toString() === userId.toString()
        );

        if (playerIndex === -1) {
            throw { status: 404, message: 'Bạn không có trong danh sách event này' };
        }

        const player = event.interestedPlayers[playerIndex];

        // Không cho rời nếu event đã confirmed hoặc completed
        if (event.status === 'confirmed' || event.status === 'completed') {
            throw { status: 400, message: 'Không thể rời khỏi event đã xác nhận hoặc hoàn thành' };
        }

        // Kiểm tra deadline
        if (new Date() > event.deadline) {
            throw { status: 400, message: 'Đã quá deadline để rời khỏi event' };
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

        return {
            success: true,
            status: 200,
            message: 'Đã rời khỏi event thành công',
            data: null
        };
    }

    // Kiểm tra tự động cập nhật status event
    async autoUpdateEventStatus(eventId) {
        const event = await Event.findById(eventId);
        if (!event) return;

          const now = new Date(Date.now() + 7 * 60 * 60 * 1000);

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

    // Lấy lịch trình của user (tất cả bookings và events sắp tới)
    async getUserSchedule(userId) {
        const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
        
        // Lấy tất cả bookings sắp tới của user
        const bookings = await Booking.find({
            userId,
            startTime: { $gte: now },
            status: { $in: ['pending', 'confirmed', 'waiting'] }
        })
        .select('startTime endTime fieldId status')
        .populate('fieldId', 'name location')
        .sort({ startTime: 1 });

        // Lấy tất cả events mà user đã tham gia (accepted)
        const events = await Event.find({
            'interestedPlayers': {
                $elemMatch: {
                    userId,
                    status: 'accepted'
                }
            },
            startTime: { $gte: now },
            status: { $in: ['open', 'full', 'confirmed'] }
        })
        .select('name startTime endTime fieldId status')
        .populate('fieldId', 'name location')
        .sort({ startTime: 1 });

        // Kết hợp và format lại
        const schedule = [
            ...bookings.map(b => ({
                type: 'booking',
                id: b._id,
                startTime: b.startTime,
                endTime: b.endTime,
                field: b.fieldId,
                status: b.status
            })),
            ...events.map(e => ({
                type: 'event',
                id: e._id,
                name: e.name,
                startTime: e.startTime,
                endTime: e.endTime,
                field: e.fieldId,
                status: e.status
            }))
        ].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

        return {
            success: true,
            status: 200,
            data: schedule
        };
    }

    // Kiểm tra xung đột thời gian
    async checkTimeConflict(userId, newStartTime, newEndTime) {
        // console.log(`Kiểm tra xung đột thời gian cho user ${userId} từ ${newStartTime} đến ${newEndTime}`);
        // Cộng thêm 7 tiếng 
        const start = new Date(new Date(newStartTime).getTime() + 7 * 60 * 60 * 1000);
        const end = new Date(new Date(newEndTime).getTime() + 7 * 60 * 60 * 1000);
        // console.log('Khoảng thời gian cần kiểm tra (UTC+7):', { start, end });
        // Kiểm tra conflict với bookings
        const conflictBooking = await Booking.findOne({
            userId,
            status: { $in: ['pending', 'confirmed', 'waiting'] },
            $or: [
                // Booking bắt đầu trong khoảng thời gian mới
                { startTime: { $gte: start, $lt: end } },
                // Booking kết thúc trong khoảng thời gian mới
                { endTime: { $gt: start, $lte: end } },
                // Booking bao trùm khoảng thời gian mới
                { startTime: { $lte: start }, endTime: { $gte: end } }
            ]
        });

        if (conflictBooking) {
            return true;
        }

        // Kiểm tra conflict với events (chỉ những event đã được accept)
        const conflictEvent = await Event.findOne({
            'interestedPlayers': {
                $elemMatch: {
                    userId,
                    status: 'accepted'
                }
            },
            status: { $in: ['open', 'full', 'confirmed'] },
            $or: [
                { startTime: { $gte: start, $lt: end } },
                { endTime: { $gt: start, $lte: end } },
                { startTime: { $lte: start }, endTime: { $gte: end } }
            ]
        });

        return !!conflictEvent;
    }
}

module.exports = new EventService();