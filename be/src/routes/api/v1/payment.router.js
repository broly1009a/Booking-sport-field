const express = require('express');
const router = express.Router();
const PaymentController = require('../../../controllers/payment.controller');

// Đặt sân và thanh toán online
router.post('/booking', PaymentController.createBookingAndPayment);

// Nạp tiền vào ví
router.post('/topup', PaymentController.topUpWallet);

// Callback từ VNPAY
router.get('/vnpay-return', PaymentController.handleVnpayReturnUrl);

// Thanh toán booking bằng ví
router.post('/wallet', PaymentController.payBookingByWallet);
router.get('/booking-by-payment/:paymentId', PaymentController.getBookingByPaymentId);
module.exports = router;