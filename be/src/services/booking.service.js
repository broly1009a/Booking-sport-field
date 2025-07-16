const { User } = require('../models');
const bookingModel = require('../models/booking.model');
const SportField = require('../models/sportField.model');
const Schedule = require('../models/schedule.model');
const Feedback = require('../models/feedback.model');
const mongoose = require('mongoose');
class BookingService {
    async createBooking(bookingData) {
        const { startTime, endTime, fieldId, userId, participants = [], customerName, phoneNumber } = bookingData;
        if (!startTime || !endTime) {
            throw { status: 400, message: 'Start time và end time là bắt buộc.' };
        }
        // Chuyển sang Date object
        const start = new Date(startTime);
        const end = new Date(endTime);

        const now = new Date();
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
        if (participants.length + 1 > field.capacity) {
            throw { status: 400, message: 'Số lượng người tham gia vượt quá sức chứa của sân.' };
        }

        // Kiểm tra trùng lịch đặt sân
        const overlap = await bookingModel.findOne({
            fieldId,
            status: { $in: ['pending', 'confirmed'] },
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
            if (from) query.startTime.$gte = new Date(from);
            if (to) query.startTime.$lte = new Date(to);
        }

        let fieldFilter = {};
        if (type) fieldFilter.type = type;
        if (search) fieldFilter.name = { $regex: search, $options: 'i' };

        if (type || search) {
            const fields = await SportField.find(fieldFilter).select('_id');
            const fieldIds = fields.map(f => f._id);
            query.fieldId = { $in: fieldIds };
        }

        const [data, total] = await Promise.all([
            bookingModel.find(query)
                .select('_id fieldId startTime endTime status totalPrice participants')
                .populate({ path: 'userId', select: '_id fname lname phoneNumber' })
                .populate({ path: 'fieldId', select: '_id name location type' })
                .populate({ path: 'participants', select: '_id fname lname phoneNumber' })
                .skip(Number(skip))
                .limit(Number(limit)),
            bookingModel.countDocuments(query)
        ]);

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
                    from: 'matchmakings', // collection name in MongoDB
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