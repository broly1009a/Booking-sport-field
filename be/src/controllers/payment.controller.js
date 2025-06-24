const Payment = require('../models/payment.model');
const PaymentService = require('../services/payment.service');

class PaymentController {
    // Đặt sân và tạo payment + trả về URL thanh toán VNPAY
    async createBookingAndPayment(req, res, next) {
        try {
            const { booking, payment, vnpUrl } = await PaymentService.createBookingAndPayment(req.body, req);
            res.status(201).json({ success: true, booking, payment, vnpUrl });
        } catch (error) {
            next(error);
        }
    }

    // Nạp tiền vào ví (tạo payment nạp ví + trả về URL thanh toán VNPAY)
    async topUpWallet(req, res, next) {
        try {
            // req.body: { userId, amount }
            const payment = await Payment.create({
                userId: req.body.userId,
                amount: req.body.amount,
                paymentMethod: 'vnpay',
                status: 'pending'
            });
            const vnpUrl = await PaymentService.createPaymentUrl(payment, req);
            res.status(201).json({ success: true, payment, vnpUrl });
        } catch (error) {
            next(error);
        }
    }

    // Xử lý callback từ VNPAY
    async handleVnpayReturnUrl(req, res, next) {
        try {
            const result = await PaymentService.handleVnpayReturnUrl(req);
            res.status(200).json({ success: true, message: result });
        } catch (error) {
            next(error);
        }
    }

    // Thanh toán booking bằng ví (sau khi đã nạp tiền)
    async payBookingByWallet(req, res, next) {
        try {
            const booking = await PaymentService.payBookingByWallet(req.body);
            res.status(200).json({ success: true, booking });
        } catch (error) {
            next(error);
        }
    }
        async getBookingByPaymentId(req, res, next) {
        try {
            const booking = await PaymentService.getBookingByPaymentId(req.params.paymentId);
            res.status(200).json({ success: true, data: booking });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PaymentController();