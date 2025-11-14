const express = require('express');
const router = express.Router();
const pickleballBookingController = require('../controllers/pickleballBooking.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Tất cả các routes yêu cầu authentication
router.use(authenticate);

// Routes cho Pickleball booking
router.post('/bookings', pickleballBookingController.createBooking);
router.post('/bookings/:bookingId/join', pickleballBookingController.joinBooking);
router.post('/bookings/:bookingId/cancel', pickleballBookingController.cancelParticipation);
router.patch('/bookings/:bookingId/payment', pickleballBookingController.updatePaymentStatus);
router.get('/bookings/waiting', pickleballBookingController.getWaitingBookings);

module.exports = router;