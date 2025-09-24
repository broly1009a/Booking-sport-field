const Payment = require('../models/payment.model');
const Booking = require('../models/booking.model');
const Wallet = require('../models/wallet.model');
const WalletTransaction = require('../models/walletTransaction.model');
const Transaction = require('../models/transaction.model');
const querystring = require('qs');
const crypto = require('crypto');
const moment = require('moment');
const BookingService = require('./booking.service');
const EquipmentRentalService = require('./equipmentRental.service');
const ConsumablePurchaseService = require('./consumablePurchase.service');
const EquipmentRental = require('../models/equipmentRental.model');
const ConsumablePurchase = require('../models/consumablePurchase.model');
class PaymentService {
    // Tạo booking và payment cho thanh toán online
    async createBookingAndPayment(bookingData, req) {
        // 1. Tạo booking (pending)
        const booking = await BookingService.createBooking(bookingData);
        if (Array.isArray(bookingData.items) && bookingData.items.length > 0) {
            // Thiết bị
            const equipmentItems = bookingData.items.filter(i => i.type === 'equipment' && i.quantity > 0);
            if (equipmentItems.length > 0) {
                await EquipmentRental.create({
                    userId: bookingData.userId,
                    bookingId: booking._id,
                    equipments: equipmentItems.map(item => ({
                        equipmentId: item.productId,
                        quantity: item.quantity
                    })),
                    totalPrice: equipmentItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
                });
            }
            // Đồ tiêu thụ
            const consumableItems = bookingData.items.filter(i => i.type === 'consumable' && i.quantity > 0);
            if (consumableItems.length > 0) {
                await ConsumablePurchase.create({
                    userId: bookingData.userId,
                    bookingId: booking._id,
                    consumables: consumableItems.map(item => ({
                        consumableId: item.productId,
                        quantity: item.quantity
                    })),
                    totalPrice: consumableItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
                });
            }
        }
        // 2. Tạo payment (pending)
        const payment = await Payment.create({
            bookingId: booking._id,
            userId: bookingData.userId,
            amount: bookingData.totalPrice,
            paymentMethod: 'vnpay',
            status: 'pending'
        });

        // 3. Tạo URL thanh toán VNPAY
        const vnpUrl = await this.createPaymentUrl(payment, req);

        return { booking, payment, vnpUrl };
    }

    // Tạo URL thanh toán VNPAY cho payment (dùng cho cả booking và nạp ví)
    async createPaymentUrl(payment, req) {
        const ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket?.remoteAddress;

        const tmnCode = process.env.VNP_TMN_CODE;
        const secretKey = process.env.VNP_HASH_SECRET;
        let vnpUrl = process.env.VNP_URL;
        const returnUrl = process.env.VNP_RETURN_URL;
        console.log("tmnCode:", tmnCode);
        console.log("secretKey:", secretKey);
        console.log("vnpUrl:", vnpUrl);
        const date = new Date();
        const createDate = moment(date).format("YYYYMMDDHHmmss");
        const orderId = payment._id.toString();
        const amount = payment.amount;
        const isBooking = !!payment.bookingId;
        const description = isBooking ? 'Thanh toán đặt sân' : 'Nạp tiền vào ví';
        const type = isBooking ? 'booking' : 'topup';
        const locale = 'vn';
        const currCode = 'VND';
        const bankCode = req.body.bankCode || '';

        let vnp_Params = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': tmnCode,
            'vnp_Locale': locale,
            'vnp_CurrCode': currCode,
            'vnp_TxnRef': orderId,
            'vnp_OrderInfo': description,
            'vnp_OrderType': type,
            'vnp_Amount': amount * 100,
            'vnp_ReturnUrl': returnUrl,
            'vnp_IpAddr': ipAddr,
            'vnp_CreateDate': createDate,
        };
        if (bankCode !== null && bankCode !== '') {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        vnp_Params = this.sortObject(vnp_Params);
        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

        // Lưu transaction
        await Transaction.create({
            userId: payment.userId,
            bookingId: payment.bookingId || undefined,
            amount,
            bankCode: req.body.bankCode,
            description,
            type,
            language: locale,
            paymentStatus: 'Pending'
        });

        return vnpUrl;
    }

    // Xử lý callback từ VNPAY cho cả booking và nạp ví
    async handleVnpayReturnUrl(req) {
        const responseData = req.query;
        const secureHash = responseData.vnp_SecureHash;
        delete responseData.vnp_SecureHash;
        delete responseData.vnp_SecureHashType;

        const secretKey = process.env.VNP_HASH_SECRET;
        const sortedData = this.sortObject(responseData);
        const signData = querystring.stringify(sortedData, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash !== signed) {
            throw new Error('Checksum validation failed');
        }

        const paymentId = responseData.vnp_TxnRef;
        const payment = await Payment.findById(paymentId);

        if (!payment) throw new Error('Payment not found');

        // Cập nhật trạng thái transaction
        await Transaction.findOneAndUpdate({ orderId: paymentId }, {
            paymentStatus: responseData.vnp_ResponseCode === '00' ? 'Success' : 'Failed',
            paymentTime: new Date()
        });

        // Nếu là thanh toán booking
        if (payment.bookingId) {
            await Payment.findByIdAndUpdate(paymentId, {
                status: responseData.vnp_ResponseCode === '00' ? 'completed' : 'failed',
                transactionId: responseData.vnp_TransactionNo,
                paymentTime: new Date()
            });

            await Booking.findByIdAndUpdate(
                payment.bookingId,
                { status: responseData.vnp_ResponseCode === '00' ? 'waiting' : 'cancelled' }
            );

            // Nếu thanh toán thất bại, trả lại slot về available
            if (responseData.vnp_ResponseCode !== '00') {
                const booking = await Booking.findById(payment.bookingId);
                if (booking) {
                    await BookingService.releaseScheduleSlots(booking);
                }
            }
        } else {
            // Nếu là nạp ví
            if (responseData.vnp_ResponseCode === '00') {
                // Cộng tiền vào ví
                let wallet = await Wallet.findOne({ userId: payment.userId });
                if (!wallet) {
                    wallet = await Wallet.create({ userId: payment.userId, balance: 0 });
                }
                wallet.balance += payment.amount;
                await wallet.save();

                await WalletTransaction.create({
                    walletId: wallet._id,
                    userId: payment.userId,
                    type: 'deposit',
                    amount: payment.amount,
                    status: 'completed',
                    description: 'Nạp tiền vào ví'
                });

                payment.status = 'completed';
                await payment.save();
            } else {
                payment.status = 'failed';
                await payment.save();
            }
        }

        return responseData.vnp_ResponseCode === '00' ? 'Payment successful' : 'Payment failed';
    }

    // Thanh toán booking bằng ví (sau khi đã nạp tiền)
    async payBookingByWallet({ bookingId, userId, amount }) {
        const booking = await Booking.findById(bookingId);
        if (!booking) throw new Error('Booking không tồn tại');
        if (booking.status !== 'pending') throw new Error('Booking không hợp lệ để thanh toán');

        const wallet = await Wallet.findOne({ userId });
        if (!wallet || wallet.balance < amount) throw new Error('Số dư ví không đủ');

        wallet.balance -= amount;
        await wallet.save();

        await WalletTransaction.create({
            walletId: wallet._id,
            userId,
            type: 'payment',
            amount,
            status: 'completed',
            description: `Thanh toán booking #${bookingId}`,
            relatedBookingId: bookingId
        });

        // Cập nhật trạng thái payment và booking
        await Payment.create({
            bookingId,
            userId,
            amount,
            paymentMethod: 'wallet',
            status: 'completed'
        });

        booking.status = 'waiting';
        await booking.save();

        return booking;
    }

    // Sắp xếp object để ký hash
    sortObject(obj) {
        let sorted = {};
        let str = [];
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                str.push(encodeURIComponent(key));
            }
        }
        str.sort();
        for (let key = 0; key < str.length; key++) {
            sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
        }
        return sorted;
    }
    async getBookingByPaymentId(paymentId) {
        const payment = await Payment.findById(paymentId);
        if (!payment || !payment.bookingId) throw new Error('Không tìm thấy payment hoặc bookingId');
        // Lấy booking và populate fieldId để lấy tên sân
        const booking = await Booking.findById(payment.bookingId).populate('fieldId');
        if (!booking) throw new Error('Không tìm thấy booking');

        // Lấy thiết bị đã thuê
        const equipmentRental = await EquipmentRental.findOne({ bookingId: booking._id }).populate('equipments.equipmentId');
        // Lấy đồ tiêu thụ đã mua
        const consumablePurchase = await ConsumablePurchase.findOne({ bookingId: booking._id }).populate('consumables.consumableId');

        // Build danh sách items
        let selectedItems = [];
        if (equipmentRental && equipmentRental.equipments) {
            selectedItems = selectedItems.concat(
                equipmentRental.equipments.map(e => ({
                    _id: e.equipmentId?._id,
                    name: e.equipmentId?.name,
                    type: 'equipment',
                    price: e.equipmentId?.pricePerUnit,
                    quantity: e.quantity
                }))
            );
        }
        if (consumablePurchase && consumablePurchase.consumables) {
            selectedItems = selectedItems.concat(
                consumablePurchase.consumables.map(c => ({
                    _id: c.consumableId?._id,
                    name: c.consumableId?.name,
                    type: 'consumable',
                    price: c.consumableId?.pricePerUnit,
                    quantity: c.quantity
                }))
            );
        }

        // Build bookingData object
        const bookingData = {
            _id: booking._id,
            fieldName: booking.fieldId?.name,
            startTime: booking.startTime,
            endTime: booking.endTime,
            totalPrice: booking.totalPrice,
            customerName: booking.customerName,
            phoneNumber: booking.phoneNumber,
            note: booking.notes,
            selectedItems
        };

        return bookingData;
    }
}

module.exports = new PaymentService();