const pickleballBookingService = require('../services/pickleballBooking.service');
const { asyncHandler } = require('../middlewares/errorHandle.middleware');

class PickleballBookingController {
    // Tạo booking mới (private hoặc shared)
    createBooking = asyncHandler(async (req, res) => {
        const bookingData = req.body;
        const userId = req.user._id;
        const booking = await pickleballBookingService.createBooking(bookingData, userId);
        res.status(201).json({
            success: true,
            data: booking
        });
    });

    // Tham gia vào booking shared hiện có
    joinBooking = asyncHandler(async (req, res) => {
        const { bookingId } = req.params;
        const userId = req.user._id;
        const booking = await pickleballBookingService.joinExistingBooking(bookingId, userId);
        res.json({
            success: true,
            data: booking
        });
    });

    // Hủy tham gia booking
    cancelParticipation = asyncHandler(async (req, res) => {
        const { bookingId } = req.params;
        const userId = req.user._id;
        const booking = await pickleballBookingService.cancelParticipation(bookingId, userId);
        res.json({
            success: true,
            data: booking
        });
    });

    // Cập nhật trạng thái thanh toán
    updatePaymentStatus = asyncHandler(async (req, res) => {
        const { bookingId } = req.params;
        const { status } = req.body;
        const userId = req.user._id;
        const booking = await pickleballBookingService.updatePaymentStatus(bookingId, userId, status);
        res.json({
            success: true,
            data: booking
        });
    });

    // Lấy danh sách booking shared đang chờ
    getWaitingBookings = asyncHandler(async (req, res) => {
        const { fieldId, date } = req.query;
        const bookings = await Booking.find({
            fieldId,
            bookingType: 'shared',
            status: 'waiting',
            startTime: {
                $gte: new Date(date),
                $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
            }
        }).populate('participantDetails.userId', 'name email');
        
        res.json({
            success: true,
            data: bookings
        });
    });
}

module.exports = new PickleballBookingController();