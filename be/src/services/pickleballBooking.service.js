const Booking = require('../models/booking.model');
const { NotFoundError, ValidationError } = require('../utils/errors');

class PickleballBookingService {
    // Tạo booking mới
    async createBooking(bookingData, userId) {
        try {
            const { bookingType, startTime, endTime, fieldId } = bookingData;
            
            // Kiểm tra xem có booking nào đang chờ trong cùng khung giờ không
            if (bookingType === 'shared') {
                const existingBooking = await this.findAvailableSharedBooking(fieldId, startTime, endTime);
                if (existingBooking) {
                    return await this.joinExistingBooking(existingBooking._id, userId);
                }
            }

            // Tính toán giá và deadline
            const pricePerSlot = bookingData.totalPrice / 4; // Giá cho mỗi slot người
            const joinDeadline = new Date(startTime);
            joinDeadline.setHours(joinDeadline.getHours() - 24); // Deadline trước 24h

            const newBooking = new Booking({
                ...bookingData,
                createdBy: userId,
                userId,
                pricePerSlot,
                joinDeadline,
                participantDetails: [{
                    userId,
                    paymentStatus: 'pending'
                }],
                status: bookingType === 'private' ? 'confirmed' : 'waiting'
            });

            return await newBooking.save();
        } catch (error) {
            throw error;
        }
    }

    // Tìm booking shared còn slot trống
    async findAvailableSharedBooking(fieldId, startTime, endTime) {
        return await Booking.findOne({
            fieldId,
            startTime,
            endTime,
            bookingType: 'shared',
            status: 'waiting',
            'participantDetails.userId': { $exists: true },
            $expr: { $lt: [{ $size: "$participantDetails" }, 4] }
        });
    }

    // Tham gia vào booking hiện có
    async joinExistingBooking(bookingId, userId) {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            throw new NotFoundError('Booking not found');
        }

        if (booking.participantDetails.length >= 4) {
            throw new ValidationError('This booking is already full');
        }

        if (booking.participantDetails.some(p => p.userId.toString() === userId)) {
            throw new ValidationError('You are already in this booking');
        }

        booking.participantDetails.push({
            userId,
            paymentStatus: 'pending'
        });

        // Nếu đủ 4 người, chuyển trạng thái thành confirmed
        if (booking.participantDetails.length === 4) {
            booking.status = 'confirmed';
        }

        return await booking.save();
    }

    // Xử lý hủy tham gia
    async cancelParticipation(bookingId, userId) {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            throw new NotFoundError('Booking not found');
        }

        // Nếu là người tạo booking private
        if (booking.bookingType === 'private' && booking.createdBy.toString() === userId) {
            booking.status = 'cancelled';
            return await booking.save();
        }

        // Nếu là booking shared
        if (booking.bookingType === 'shared') {
            booking.participantDetails = booking.participantDetails.filter(
                p => p.userId.toString() !== userId
            );

            if (booking.participantDetails.length === 0) {
                booking.status = 'cancelled';
            } else if (booking.status === 'confirmed') {
                booking.status = 'waiting';
            }

            return await booking.save();
        }

        throw new ValidationError('You cannot cancel this booking');
    }

    // Xử lý timeout cho shared bookings
    async handleBookingTimeout() {
        const now = new Date();
        const expiredBookings = await Booking.find({
            bookingType: 'shared',
            status: 'waiting',
            joinDeadline: { $lt: now }
        });

        for (const booking of expiredBookings) {
            // Tự động hủy nếu không đủ người
            if (booking.participantDetails.length < 4) {
                booking.status = 'cancelled';
                // Gửi thông báo cho người tham gia
                // TODO: Implement notification system
                await booking.save();
            }
        }
    }

    // Cập nhật trạng thái thanh toán
    async updatePaymentStatus(bookingId, userId, status) {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            throw new NotFoundError('Booking not found');
        }

        const participant = booking.participantDetails.find(
            p => p.userId.toString() === userId
        );

        if (!participant) {
            throw new ValidationError('User is not a participant in this booking');
        }

        participant.paymentStatus = status;
        return await booking.save();
    }
}

module.exports = new PickleballBookingService();