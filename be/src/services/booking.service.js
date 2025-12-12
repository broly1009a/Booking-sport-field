const { User } = require('../models');
const bookingModel = require('../models/booking.model');
const SportField = require('../models/sportField.model');
const Schedule = require('../models/schedule.model');
const FieldComplex = require('../models/fieldComplex.model');
// const Feedback = require('../models/feedback.model');
const ConsumablePurchase = require('../models/consumablePurchase.model');
const EquipmentRental = require('../models/equipmentRental.model');
const Matchmaking = require('../models/matchmaking.model');
const mongoose = require('mongoose');
const notificationService = require('./notification.service');
class BookingService {
    async createBooking(bookingData) {
        const { startTime, endTime, fieldId, userId, participants = [], customerName, phoneNumber } = bookingData;
        if (!startTime || !endTime) {
            throw { status: 400, message: 'Start time và end time là bắt buộc.' };
        }
        // Chuyển sang Date object
        const start = new Date(startTime);
        const end = new Date(endTime);

        const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
        if (start >= end) {
            throw { status: 400, message: 'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.' };
        }
        if (start < now || end < now) {
            throw { status: 400, message: 'Không thể đặt sân cho thời gian trong quá khứ.' };
        }

        const user = await User.findById(userId);
        if (!user) {
            throw { status: 404, message: 'Người dùng không tồn tại.' };
        }
        const field = await SportField.findById(fieldId);
        if (!field) {
            throw { status: 404, message: 'Sân không tồn tại.' };
        }
        if (field.status !== 'available') {
            throw { status: 400, message: 'Sân hiện tại không khả dụng. Vui lòng chọn sân khác.' };
        }
        if (participants.length + 1 > field.capacity) {
            throw { status: 400, message: 'Số lượng người tham gia vượt quá sức chứa của sân.' };
        }

        // Kiểm tra trùng lịch đặt sân
        const overlap = await bookingModel.findOne({
            fieldId,
            status: { $in: ['pending', 'waiting', 'confirmed'] },
            $or: [
                {
                    startTime: { $lt: end },
                    endTime: { $gt: start }
                }
            ]
        });
        if (overlap) {
            throw { status: 409, message: 'Sân đã được đặt trong khoảng thời gian này.' };
        }

        // Nếu mọi thứ hợp lệ, tạo booking
        const booking = await new bookingModel(bookingData).save();

        // Gửi thông báo cho chủ sân và nhân viên
        try {
                const populatedField = await SportField.findById(fieldId).populate('complex');
                if (populatedField && populatedField.complex) {
                    await notificationService.notifyFieldComplex(
                        populatedField.complex._id,
                        '🎉 Booking mới',
                        `Sân ${populatedField.name} vừa được đặt từ ${start.toLocaleString('vi-VN')} đến ${end.toLocaleString('vi-VN')}. Khách hàng: ${customerName || user.fname + ' ' + user.lname}, SĐT: ${phoneNumber || user.phoneNumber}`
                    );
                }
        } catch (notifyError) {
            console.error('Lỗi khi gửi thông báo:', notifyError);
            // Không throw error để không ảnh hưởng đến quá trình tạo booking
        }

        // Cập nhật trạng thái các timeSlot trong Schedule thành 'booked'
        // Tìm schedule theo fieldId và ngày (00:00 UTC)
        const bookingDate = new Date(startTime);
        const scheduleDate = new Date(Date.UTC(
            bookingDate.getUTCFullYear(),
            bookingDate.getUTCMonth(),
            bookingDate.getUTCDate(),
            0, 0, 0, 0
        ));
        const schedule = await Schedule.findOne({ fieldId, date: scheduleDate });
        if (schedule) {
            let updated = false;
            for (const slot of schedule.timeSlots) {
                // Nếu slot giao với khoảng booking thì cập nhật
                if (
                    slot.startTime < end &&
                    slot.endTime > start
                ) {
                    slot.status = 'booked';
                    updated = true;
                }
            }
            if (updated) await schedule.save();
        }

        return booking;
    }

    async getAllBookings() {
        return await bookingModel.find()

    }
    async getBookingById(bookingId) {
        return await bookingModel.findById(bookingId)
            .populate('userId')
            .populate('fieldId')
            .populate('participants');
    }

    async updateBooking(bookingId, bookingData) {
        const updatedBooking = await bookingModel.findByIdAndUpdate(bookingId, bookingData, { new: true })
            .populate('userId')
            .populate('fieldId')
            .populate('participants');

        if (bookingData.status === 'cancelled' && updatedBooking) {
            await this.releaseScheduleSlots(updatedBooking);
            
            // Gửi thông báo khi booking bị hủy
            try {
                    const populatedField = await SportField.findById(updatedBooking.fieldId._id).populate('complex');
                    if (populatedField && populatedField.complex) {
                        await notificationService.notifyFieldComplex(
                            populatedField.complex._id,
                            '❌ Booking bị hủy',
                            `Booking sân ${populatedField.name} lúc ${updatedBooking.startTime.toLocaleString('vi-VN')} đã bị hủy.`
                        );
                    }
            } catch (notifyError) {
                console.error('Lỗi khi gửi thông báo hủy booking:', notifyError);
            }

            // Hủy matchmaking liên quan nếu booking sắp diễn ra
            try {
                const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
                if (updatedBooking.startTime > now) {
                    await Matchmaking.updateMany({ bookingId: updatedBooking._id }, { status: 'cancelled' });
                }
            } catch (matchmakingError) {
                console.error('Lỗi khi hủy matchmaking:', matchmakingError);
            }
        }

        return updatedBooking;
    }

    async deleteBooking(bookingId) {
        return await bookingModel.findByIdAndDelete(bookingId);
    }
    async getPaginatedBookings({ page = 1, limit = 5, status, type, from, to, search }) {
        const skip = (page - 1) * limit;
        const query = {};

        if (status) query.status = status;
        if (from || to) {
            query.startTime = {};
            if (from) query.startTime.$gte = new Date(new Date(from).getTime() + 7 * 60 * 60 * 1000);
            if (to) query.startTime.$lte = new Date(new Date(to).getTime() + 7 * 60 * 60 * 1000);
        }

        let fieldFilter = {};
        if (type) fieldFilter.type = type;
        if (search) fieldFilter.name = { $regex: search, $options: 'i' };

        if (type || search) {
            const fields = await SportField.find(fieldFilter).select('_id');
            const fieldIds = fields.map(f => f._id);
            query.fieldId = { $in: fieldIds };
        }

        const [bookings, total] = await Promise.all([
            bookingModel.find(query)
                .select('_id fieldId startTime endTime status totalPrice participants customerName phoneNumber notes')
                .populate({ path: 'userId', select: '_id fname lname phoneNumber' })
                .populate({ path: 'fieldId', select: '_id name location type' })
                .populate({ path: 'participants', select: '_id fname lname phoneNumber' })
                .skip(Number(skip))
                .limit(Number(limit)),
            bookingModel.countDocuments(query)
        ]);

        const data = await Promise.all(bookings.map(async (booking) => {
            const consumablePurchases = await ConsumablePurchase.find({ bookingId: booking._id })
               
                .populate({ path: 'consumables.consumableId', select: '_id name price' });
            const equipmentRentals = await EquipmentRental.find({ bookingId: booking._id })
            
                .populate({ path: 'equipments.equipmentId', select: '_id name price' });
            return {
                ...booking.toObject(),
                consumablePurchases,
                equipmentRentals
            };
        }));

        return {
            data,
            meta: {
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: Number(page),
                perPage: Number(limit)
            }
        };
    }
       
    async getBookingsByComplexOwner({ page = 1, limit = 5, status, type, from, to, search, ownerId }) {
     
        const complexes = await FieldComplex.find({ owner: ownerId }).select('_id');
        const complexIds = complexes.map(c => c._id);

        let fieldFilter = { complex: { $in: complexIds } };
        if (type) fieldFilter.type = type;
        if (search) fieldFilter.name = { $regex: search, $options: 'i' };
        const fields = await SportField.find(fieldFilter).select('_id');
        const fieldIds = fields.map(f => f._id);
       
        const query = { fieldId: { $in: fieldIds } };
        if (status) query.status = status;
        if (from || to) {
            query.startTime = {};
            if (from) query.startTime.$gte = new Date(new Date(from).getTime() + 7 * 60 * 60 * 1000);
            if (to) query.startTime.$lte = new Date(new Date(to).getTime() + 7 * 60 * 60 * 1000);
        }
        const skip = (page - 1) * limit;
        const [bookings, total] = await Promise.all([
            bookingModel.find(query)
                .select('_id fieldId startTime endTime status totalPrice participants customerName phoneNumber notes')
                .populate({ path: 'userId', select: '_id fname lname phoneNumber' })
                .populate({ path: 'fieldId', select: '_id name location type' })
                .populate({ path: 'participants', select: '_id fname lname phoneNumber' })
                .skip(Number(skip))
                .limit(Number(limit)),
            bookingModel.countDocuments(query)
        ]);
      
        const data = await Promise.all(bookings.map(async (booking) => {
            const consumablePurchases = await ConsumablePurchase.find({ bookingId: booking._id })
                .populate({ path: 'consumables.consumableId', select: '_id name price' });
            const equipmentRentals = await EquipmentRental.find({ bookingId: booking._id })
                .populate({ path: 'equipments.equipmentId', select: '_id name price' });
            return {
                ...booking.toObject(),
                consumablePurchases,
                equipmentRentals
            };
        }));
        return {
            data,
            meta: {
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: Number(page),
                perPage: Number(limit)
            }
        };
    }
      
    async getBookingsByComplexStaff({ page = 1, limit = 5, status, type, from, to, search, staffId }) {
       
        const complexes = await FieldComplex.find({ staffs: staffId }).select('_id');
        const complexIds = complexes.map(c => c._id);
     
        let fieldFilter = { complex: { $in: complexIds } };
        if (type) fieldFilter.type = type;
        if (search) fieldFilter.name = { $regex: search, $options: 'i' };
        const fields = await SportField.find(fieldFilter).select('_id');
        const fieldIds = fields.map(f => f._id);
       
        const query = { fieldId: { $in: fieldIds } };
        if (status) query.status = status;
        if (from || to) {
            query.startTime = {};
            if (from) query.startTime.$gte = new Date(new Date(from).getTime() + 7 * 60 * 60 * 1000);
            if (to) query.startTime.$lte = new Date(new Date(to).getTime() + 7 * 60 * 60 * 1000);
        }
        const skip = (page - 1) * limit;
        const [bookings, total] = await Promise.all([
            bookingModel.find(query)
                .select('_id fieldId startTime endTime status totalPrice participants customerName phoneNumber notes')
                .populate({ path: 'userId', select: '_id fname lname phoneNumber' })
                .populate({ path: 'fieldId', select: '_id name location type' })
                .populate({ path: 'participants', select: '_id fname lname phoneNumber' })
                .skip(Number(skip))
                .limit(Number(limit)),
            bookingModel.countDocuments(query)
        ]);
        const data = await Promise.all(bookings.map(async (booking) => {
            const consumablePurchases = await ConsumablePurchase.find({ bookingId: booking._id })
                .populate({ path: 'consumables.consumableId', select: '_id name price' });
            const equipmentRentals = await EquipmentRental.find({ bookingId: booking._id })
                .populate({ path: 'equipments.equipmentId', select: '_id name price' });
            return {
                ...booking.toObject(),
                consumablePurchases,
                equipmentRentals
            };
        }));
        return {
            data,
            meta: {
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: Number(page),
                perPage: Number(limit)
            }
        };
    }


    async roundAllBookingTimesToHour() {
        const bookings = await bookingModel.find();
        for (const booking of bookings) {
            // Làm tròn startTime về đầu giờ
            const start = new Date(booking.startTime);
            start.setMinutes(0, 0, 0);
            booking.startTime = start;

            // endTime = startTime + 30 phút
            const end = new Date(start);
            end.setMinutes(end.getMinutes() + 30);
            booking.endTime = end;

            await booking.save();
        }
        return { success: true, message: 'Đã làm tròn thời gian và cập nhật endTime cho tất cả booking.' };
    }
    
    async getBookingsByUser(userId) {
        return await bookingModel.aggregate([
            { $match: { userId: typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId } },
            {
                $lookup: {
                    from: 'matchmakings',
                    localField: '_id',
                    foreignField: 'bookingId',
                    as: 'matchmaking'
                }
            },
            {
                $lookup: {
                    from: 'sportfields',
                    localField: 'fieldId',
                    foreignField: '_id',
                    as: 'field'
                }
            },
            {
                $unwind: { path: '$field', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'participants',
                    foreignField: '_id',
                    as: 'participants'
                }
            },
            {
                $lookup: {
                    from: 'feedbacks',
                    localField: '_id',
                    foreignField: 'bookingId',
                    as: 'feedbacks'
                }
            },
            {
                $lookup: {
                    from: 'consumablepurchases',
                    localField: '_id',
                    foreignField: 'bookingId',
                    as: 'consumablePurchases'
                }
            },
            {
                $unwind: { path: '$consumablePurchases', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'consumables',
                    let: { consumables: { $ifNull: ['$consumablePurchases.consumables', []] } },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', { $map: { input: '$$consumables', as: 'c', in: '$$c.consumableId' } }] } } },
                        { $project: { _id: 1, name: 1, price: 1 } }
                    ],
                    as: 'consumableDetails'
                }
            },
            {
                $lookup: {
                    from: 'equipmentrentals',
                    localField: '_id',
                    foreignField: 'bookingId',
                    as: 'equipmentRentals'
                }
            },
            {
                $unwind: { path: '$equipmentRentals', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'equipment',
                    let: { equipments: { $ifNull: ['$equipmentRentals.equipments', []] } },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', { $map: { input: '$$equipments', as: 'e', in: '$$e.equipmentId' } }] } } },
                        { $project: { _id: 1, name: 1, price: 1 } }
                    ],
                    as: 'equipmentDetails'
                }
            },
            {
                $project: {
                    _id: 1,
                    field: 1,
                    startTime: 1,
                    endTime: 1,
                    totalPrice: 1,
                    customerName: 1,
                    phoneNumber: 1,
                    consumablePurchases: 1,
                    consumableDetails: 1,
                    equipmentRentals: 1,
                    equipmentDetails: 1,
                    status: 1,
                    feedbacks: 1,
                    participants: 1,
                    matchmaking: 1
                }
            }
        ]);
    }

    async getBookingsByParticipant(userId) {
        return await bookingModel.aggregate([
            { $match: { participants: typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId } },
            {
                $lookup: {
                    from: 'matchmakings',
                    localField: '_id',
                    foreignField: 'bookingId',
                    as: 'matchmaking'
                }
            },
            {
                $lookup: {
                    from: 'sportfields',
                    localField: 'fieldId',
                    foreignField: '_id',
                    as: 'field'
                }
            },
            {
                $unwind: { path: '$field', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'participants',
                    foreignField: '_id',
                    as: 'participants'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: { path: '$user', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'feedbacks',
                    localField: '_id',
                    foreignField: 'bookingId',
                    as: 'feedbacks'
                }
            },
            {
                $lookup: {
                    from: 'consumablepurchases',
                    localField: '_id',
                    foreignField: 'bookingId',
                    as: 'consumablePurchases'
                }
            },
            {
                $unwind: { path: '$consumablePurchases', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'consumables',
                    let: { consumables: { $ifNull: ['$consumablePurchases.consumables', []] } },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', { $map: { input: '$$consumables', as: 'c', in: '$$c.consumableId' } }] } } },
                        { $project: { _id: 1, name: 1, price: 1 } }
                    ],
                    as: 'consumableDetails'
                }
            },
            {
                $lookup: {
                    from: 'equipmentrentals',
                    localField: '_id',
                    foreignField: 'bookingId',
                    as: 'equipmentRentals'
                }
            },
            {
                $unwind: { path: '$equipmentRentals', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'equipment',
                    let: { equipments: { $ifNull: ['$equipmentRentals.equipments', []] } },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', { $map: { input: '$$equipments', as: 'e', in: '$$e.equipmentId' } }] } } },
                        { $project: { _id: 1, name: 1, price: 1 } }
                    ],
                    as: 'equipmentDetails'
                }
            },
            {
                $project: {
                    _id: 1,
                    field: 1,
                    user: 1,
                    startTime: 1,
                    endTime: 1,
                    totalPrice: 1,
                    customerName: 1,
                    phoneNumber: 1,
                    consumablePurchases: 1,
                    consumableDetails: 1,
                    equipmentRentals: 1,
                    equipmentDetails: 1,
                    status: 1,
                    feedbacks: 1,
                    participants: 1,
                    matchmaking: 1
                }
            }
        ]);
    }

   
    async releaseScheduleSlots(booking) {
        const { startTime, endTime, fieldId } = booking;
        const bookingDate = new Date(startTime);
        const scheduleDate = new Date(Date.UTC(
            bookingDate.getUTCFullYear(),
            bookingDate.getUTCMonth(),
            bookingDate.getUTCDate(),
            0, 0, 0, 0
        ));
        const schedule = await Schedule.findOne({ fieldId, date: scheduleDate });
        if (schedule) {
            let updated = false;
            for (const slot of schedule.timeSlots) {
                // Nếu slot giao với khoảng booking thì cập nhật lại về available
                if (
                    slot.startTime < endTime &&
                    slot.endTime > startTime &&
                    slot.status === 'booked'
                ) {
                    slot.status = 'available';
                    updated = true;
                }
            }
            if (updated) await schedule.save();
        }
    }
}

module.exports = new BookingService();