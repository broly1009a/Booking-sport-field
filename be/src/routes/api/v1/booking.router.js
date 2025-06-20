const express = require('express');
const router = express.Router();
const BookingController = require('../../../controllers/booking.controller');
router.get('/paginated', BookingController.getPaginatedBookings);
router.patch('/round-all-times', BookingController.roundAllBookingTimesToHour);
router.get('/user/:userId', BookingController.getBookingsByUser);
router.get('/', BookingController.getAllBookings);
router.get('/:id', BookingController.getBookingById);
router.post('/', BookingController.createBooking);
router.put('/:id', BookingController.updateBooking);
router.delete('/:id', BookingController.deleteBooking);

module.exports = router;