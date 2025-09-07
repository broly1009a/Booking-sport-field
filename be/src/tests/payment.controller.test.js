const PaymentController = require('../controllers/payment.controller');
const PaymentService = require('../services/payment.service');
const Payment = require('../models/payment.model');

// Mock the dependencies
jest.mock('../services/payment.service');
jest.mock('../models/payment.model');

describe('PaymentController', () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        mockReq = {
            body: {},
            params: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockNext = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createBookingAndPayment', () => {
        it('UTCID01: should create booking and payment successfully', async () => {
            const mockData = {
                booking: { id: 1 },
                payment: { id: 1 },
                vnpUrl: 'http://example.com'
            };
            PaymentService.createBookingAndPayment.mockResolvedValue(mockData);

            await PaymentController.createBookingAndPayment(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                booking: mockData.booking,
                payment: mockData.payment,
                vnpUrl: mockData.vnpUrl
            });
        });

        it('UTCID02: should handle errors properly', async () => {
            const error = new Error('Test error');
            PaymentService.createBookingAndPayment.mockRejectedValue(error);

            await PaymentController.createBookingAndPayment(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('topUpWallet', () => {
        it('UTCID03: should top up wallet successfully', async () => {
            const mockPayment = {
                id: 1,
                userId: 'user1',
                amount: 100000
            };
            const mockVnpUrl = 'http://example.com/payment';
            
            mockReq.body = {
                userId: 'user1',
                amount: 100000
            };

            Payment.create.mockResolvedValue(mockPayment);
            PaymentService.createPaymentUrl.mockResolvedValue(mockVnpUrl);

            await PaymentController.topUpWallet(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                payment: mockPayment,
                vnpUrl: mockVnpUrl
            });
        });

        it('UTCID04: should handle errors in top up wallet', async () => {
            const error = new Error('Test error');
            Payment.create.mockRejectedValue(error);

            await PaymentController.topUpWallet(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('handleVnpayReturnUrl', () => {
        it('UTCID05: should handle VNPAY return URL successfully', async () => {
            const mockResult = 'Payment successful';
            PaymentService.handleVnpayReturnUrl.mockResolvedValue(mockResult);

            await PaymentController.handleVnpayReturnUrl(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: mockResult
            });
        });

        it('UTCID06: should handle errors in VNPAY return', async () => {
            const error = new Error('Test error');
            PaymentService.handleVnpayReturnUrl.mockRejectedValue(error);

            await PaymentController.handleVnpayReturnUrl(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('payBookingByWallet', () => {
        it('UTCID07: should pay booking by wallet successfully', async () => {
            const mockBooking = {
                id: 1,
                status: 'paid'
            };
            PaymentService.payBookingByWallet.mockResolvedValue(mockBooking);

            await PaymentController.payBookingByWallet(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                booking: mockBooking
            });
        });

        it('UTCID08: should handle errors in wallet payment', async () => {
            const error = new Error('Test error');
            PaymentService.payBookingByWallet.mockRejectedValue(error);

            await PaymentController.payBookingByWallet(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('getBookingByPaymentId', () => {
        it('UTCID09: should get booking by payment ID successfully', async () => {
            const mockBooking = {
                id: 1,
                paymentId: 'payment1'
            };
            mockReq.params.paymentId = 'payment1';
            PaymentService.getBookingByPaymentId.mockResolvedValue(mockBooking);

            await PaymentController.getBookingByPaymentId(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockBooking
            });
        });

        it('UTCID10: should handle errors when getting booking by payment ID', async () => {
            const error = new Error('Test error');
            mockReq.params.paymentId = 'payment1';
            PaymentService.getBookingByPaymentId.mockRejectedValue(error);

            await PaymentController.getBookingByPaymentId(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
});
