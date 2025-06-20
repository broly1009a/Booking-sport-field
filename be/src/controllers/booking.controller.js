const BookingService = require('../services/booking.service');

class BookingController {
    async createBooking(req, res, next) {
        try {
            const bookingData = req.body;
            const booking = await BookingService.createBooking(bookingData);
            res.status(201).json({ success: true, data: booking });
        } catch (error) {
            next(error);
        }
    }

    async getAllBookings(req, res, next) {
        try {
            const bookings = await BookingService.getAllBookings();
            res.status(200).json({ success: true, data: bookings });
        } catch (error) {
            next(error);
        }
    }

    async getBookingById(req, res, next) {
        try {
            const { id } = req.params;
            const booking = await BookingService.getBookingById(id);
            if (!booking) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }
            res.status(200).json({ success: true, data: booking });
        } catch (error) {
            next(error);
        }
    }

    async updateBooking(req, res, next) {
        try {
            const { id } = req.params;
            const bookingData = req.body;
            const updatedBooking = await BookingService.updateBooking(id, bookingData);
            if (!updatedBooking) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }
            res.status(200).json({ success: true, data: updatedBooking });
        } catch (error) {
            next(error);
        }
    }

    async deleteBooking(req, res, next) {
        try {
            const { id } = req.params;
            const deletedBooking = await BookingService.deleteBooking(id);
            if (!deletedBooking) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }
            res.status(200).json({ success: true, message: 'Booking deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
    
  async getPaginatedBookings(req, res, next) {
    try {
        const { page, limit, status, from, to, type, search } = req.query;
        const result = await BookingService.getPaginatedBookings({ page, limit, status, from, to, type, search });
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}
async roundAllBookingTimesToHour(req, res, next) {
    try {
        const result = await BookingService.roundAllBookingTimesToHour();
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}
async getBookingsByUser(req, res, next) {
    try {
        const { userId } = req.params;
        const bookings = await BookingService.getBookingsByUser(userId);
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        next(error);
    }
}
}

module.exports = new BookingController();