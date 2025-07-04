const PaymentService = require('../payment.service');
const Payment = require('../../models/payment.model');
const Booking = require('../../models/booking.model');
const Wallet = require('../../models/wallet.model');
const WalletTransaction = require('../../models/walletTransaction.model');
const Transaction = require('../../models/transaction.model');
const EquipmentRental = require('../../models/equipmentRental.model');
const ConsumablePurchase = require('../../models/consumablePurchase.model');
const BookingService = require('../booking.service');
const crypto = require('crypto');
const moment = require('moment');

jest.mock('../../models/payment.model');
jest.mock('../../models/booking.model');
jest.mock('../../models/wallet.model');
jest.mock('../../models/walletTransaction.model');
jest.mock('../../models/transaction.model');
jest.mock('../../models/equipmentRental.model');
jest.mock('../../models/consumablePurchase.model');
jest.mock('../booking.service');

describe('PaymentService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createBookingAndPayment', () => {
    it('should create booking, payment and vnpay url', async () => {
        BookingService.createBooking.mockResolvedValue({ _id: 'b1' });
        Payment.create.mockResolvedValue({ _id: 'p1' });
        // Sử dụng spyOn để mock và restore sau test
        const spy = jest.spyOn(PaymentService, 'createPaymentUrl').mockResolvedValue('http://vnpay.url');
        const bookingData = { userId: 'u1', totalPrice: 100, items: [] };
        const req = { body: {}, headers: {}, connection: {}, socket: {} };
        const result = await PaymentService.createBookingAndPayment(bookingData, req);
        expect(result).toHaveProperty('booking');
        expect(result).toHaveProperty('payment');
        expect(result).toHaveProperty('vnpUrl');
        spy.mockRestore();
    });
});

describe('createPaymentUrl', () => {
    it('should return vnpay url and create transaction', async () => {
        process.env.VNP_TMN_CODE = 'code';
        process.env.VNP_HASH_SECRET = 'secret';
        process.env.VNP_URL = 'http://vnpay';
        process.env.VNP_RETURN_URL = 'http://return';
        const payment = { _id: 'p1', userId: 'u1', amount: 100, bookingId: 'b1' };
        const req = { body: {}, headers: {}, connection: {}, socket: {} };
        Transaction.create.mockResolvedValue({});
        if (PaymentService.createPaymentUrl.mockRestore) {
            PaymentService.createPaymentUrl.mockRestore();
        }
        const url = await PaymentService.createPaymentUrl(payment, req);
        expect(url.startsWith('http://vnpay?')).toBe(true);
        expect(Transaction.create).toHaveBeenCalled();
    });
});

    describe('handleVnpayReturnUrl', () => {
        it('should throw if checksum invalid', async () => {
            process.env.VNP_HASH_SECRET = 'secret';
            const req = { query: { vnp_SecureHash: 'invalid', vnp_TxnRef: 'p1' } };
            jest.spyOn(crypto, 'createHmac').mockReturnValue({
                update: () => ({ digest: () => 'notmatch' })
            });
            await expect(PaymentService.handleVnpayReturnUrl(req)).rejects.toThrow('Checksum validation failed');
        });

        it('should handle booking payment success', async () => {
            process.env.VNP_HASH_SECRET = 'secret';
            const req = { query: { vnp_SecureHash: 'match', vnp_TxnRef: 'p1', vnp_ResponseCode: '00', vnp_TransactionNo: 'tx123' } };
            jest.spyOn(crypto, 'createHmac').mockReturnValue({
                update: () => ({ digest: () => 'match' })
            });
            Payment.findById.mockResolvedValue({ _id: 'p1', bookingId: 'b1', userId: 'u1' });
            Transaction.findOneAndUpdate.mockResolvedValue({});
            Payment.findByIdAndUpdate.mockResolvedValue({});
            Booking.findByIdAndUpdate.mockResolvedValue({});
            const result = await PaymentService.handleVnpayReturnUrl(req);
            expect(result).toBe('Payment successful');
        });

        it('should handle wallet topup success', async () => {
            process.env.VNP_HASH_SECRET = 'secret';
            const req = { query: { vnp_SecureHash: 'match', vnp_TxnRef: 'p2', vnp_ResponseCode: '00' } };
            jest.spyOn(crypto, 'createHmac').mockReturnValue({
                update: () => ({ digest: () => 'match' })
            });
            Payment.findById.mockResolvedValue({ _id: 'p2', bookingId: undefined, userId: 'u2', amount: 100, status: 'pending', save: jest.fn() });
            Transaction.findOneAndUpdate.mockResolvedValue({});
            Wallet.findOne.mockResolvedValue({ _id: 'w2', userId: 'u2', balance: 0, save: jest.fn() });
            WalletTransaction.create.mockResolvedValue({});
            const result = await PaymentService.handleVnpayReturnUrl(req);
            expect(result).toBe('Payment successful');
        });

        it('should handle wallet topup fail', async () => {
            process.env.VNP_HASH_SECRET = 'secret';
            const req = { query: { vnp_SecureHash: 'match', vnp_TxnRef: 'p2', vnp_ResponseCode: '01' } };
            jest.spyOn(crypto, 'createHmac').mockReturnValue({
                update: () => ({ digest: () => 'match' })
            });
            const save = jest.fn();
            Payment.findById.mockResolvedValue({ _id: 'p2', bookingId: undefined, userId: 'u2', amount: 100, status: 'pending', save });
            Transaction.findOneAndUpdate.mockResolvedValue({});
            Wallet.findOne.mockResolvedValue(null);
            Wallet.create.mockResolvedValue({ _id: 'w2', userId: 'u2', balance: 0, save });
            const result = await PaymentService.handleVnpayReturnUrl(req);
            expect(result).toBe('Payment failed');
        });
    });

    describe('payBookingByWallet', () => {
        it('should throw if booking not found', async () => {
            Booking.findById.mockResolvedValue(null);
            await expect(PaymentService.payBookingByWallet({ bookingId: 'b1', userId: 'u1', amount: 100 }))
                .rejects.toThrow('Booking không tồn tại');
        });

        it('should throw if booking not pending', async () => {
            Booking.findById.mockResolvedValue({ _id: 'b1', status: 'confirmed' });
            await expect(PaymentService.payBookingByWallet({ bookingId: 'b1', userId: 'u1', amount: 100 }))
                .rejects.toThrow('Booking không hợp lệ để thanh toán');
        });

        it('should throw if wallet not found or insufficient', async () => {
            Booking.findById.mockResolvedValue({ _id: 'b1', status: 'pending' });
            Wallet.findOne.mockResolvedValue(null);
            await expect(PaymentService.payBookingByWallet({ bookingId: 'b1', userId: 'u1', amount: 100 }))
                .rejects.toThrow('Số dư ví không đủ');
        });

        it('should pay booking by wallet', async () => {
            const save = jest.fn();
            Booking.findById.mockResolvedValue({ _id: 'b1', status: 'pending', save });
            Wallet.findOne.mockResolvedValue({ _id: 'w1', userId: 'u1', balance: 200, save: jest.fn() });
            WalletTransaction.create.mockResolvedValue({});
            Payment.create.mockResolvedValue({});
            const result = await PaymentService.payBookingByWallet({ bookingId: 'b1', userId: 'u1', amount: 100 });
            expect(result).toHaveProperty('_id', 'b1');
            expect(save).toHaveBeenCalled();
        });
    });

    describe('getBookingByPaymentId', () => {
        it('should throw if payment or bookingId not found', async () => {
            Payment.findById.mockResolvedValue(null);
            await expect(PaymentService.getBookingByPaymentId('p1')).rejects.toThrow('Không tìm thấy payment hoặc bookingId');
        });

        it('should throw if booking not found', async () => {
            Payment.findById.mockResolvedValue({ _id: 'p1', bookingId: 'b1' });
            Booking.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
            await expect(PaymentService.getBookingByPaymentId('p1')).rejects.toThrow('Không tìm thấy booking');
        });

        it('should return booking data with items', async () => {
            Payment.findById.mockResolvedValue({ _id: 'p1', bookingId: 'b1' });
            Booking.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue({
                    _id: 'b1',
                    fieldId: { name: 'Sân A' },
                    startTime: '2024-06-01T10:00:00Z',
                    endTime: '2024-06-01T11:00:00Z',
                    totalPrice: 100,
                    customerName: 'A',
                    phoneNumber: '123',
                    notes: 'note'
                })
            });
            EquipmentRental.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue({
                    equipments: [
                        { equipmentId: { _id: 'e1', name: 'Vợt', pricePerUnit: 10 }, quantity: 2 }
                    ]
                })
            });
            ConsumablePurchase.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue({
                    consumables: [
                        { consumableId: { _id: 'c1', name: 'Nước', pricePerUnit: 5 }, quantity: 3 }
                    ]
                })
            });
            const result = await PaymentService.getBookingByPaymentId('p1');
            expect(result).toHaveProperty('selectedItems');
            expect(result.selectedItems.length).toBeGreaterThan(0);
        });
    });
});