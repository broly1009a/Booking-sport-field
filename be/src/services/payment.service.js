const Payment = require('../models/payment.model');
const Booking = require('../models/booking.model');
const Wallet = require('../models/wallet.model');
const WalletTransaction = require('../models/walletTransaction.model');
const Transaction = require('../models/transaction.model');
const querystring = require('qs');
const crypto = require('crypto');
const moment = require('moment');
const BookingService = require('./booking.service');
// const EquipmentRentalService = require('./equipmentRental.service');
// const ConsumablePurchaseService = require('./consumablePurchase.service');
const EquipmentRental = require('../models/equipmentRental.model');
const ConsumablePurchase = require('../models/consumablePurchase.model');
const Equipment = require('../models/equipment.model');
const Consumable = require('../models/consumable.model');
const User = require('../models/user.model');
class PaymentService {
    // Tạo booking và payment cho thanh toán online
    async createBookingAndPayment(bookingData, req) {
            console.log('=== START createBookingAndPayment ===');
            console.log('bookingData.items:', JSON.stringify(bookingData.items, null, 2));
            
            // 1. Kiểm tra số lượng tồn kho trước khi tạo booking
            if (Array.isArray(bookingData.items) && bookingData.items.length > 0) {
                // Kiểm tra thiết bị
                const equipmentItems = bookingData.items.filter(i => i.type === 'equipment' && i.quantity > 0);
                console.log('equipmentItems to check:', equipmentItems);
                
                for (const item of equipmentItems) {
                    const equipment = await Equipment.findById(item.productId);
                    console.log(`Equipment ${item.productId} - Tồn kho: ${equipment?.quantity}, Yêu cầu: ${item.quantity}`);
                    
                    if (!equipment) throw new Error(`Thiết bị không tồn tại: ${item.productId}`);
                    if (item.quantity > equipment.quantity) {
                        throw new Error(`Thiết bị '${equipment.name}' chỉ còn ${equipment.quantity}, bạn yêu cầu ${item.quantity}`);
                    }
                }
                
                // Kiểm tra đồ tiêu thụ
                const consumableItems = bookingData.items.filter(i => i.type === 'consumable' && i.quantity > 0);
                console.log('consumableItems to check:', consumableItems);
                
                    for (const item of consumableItems) {
                        const consumable = await Consumable.findById(item.productId);
                        console.log(`Consumable ${item.productId} - Tồn kho: ${consumable?.quantityInStock}, Yêu cầu: ${item.quantity}`);
                    
                        if (!consumable) throw new Error(`Đồ tiêu thụ không tồn tại: ${item.productId}`);
                        if (item.quantity > consumable.quantityInStock) {
                            throw new Error(`Đồ tiêu thụ '${consumable.name}' chỉ còn ${consumable.quantityInStock}, bạn yêu cầu ${item.quantity}`);
                        }
                    }
            }

            // 2. Tạo booking (pending)
            console.log('Creating booking...');
            const booking = await BookingService.createBooking(bookingData);
            console.log('Booking created:', booking._id);
            if (Array.isArray(bookingData.items) && bookingData.items.length > 0) {
                // Thiết bị
                const equipmentItems = bookingData.items.filter(i => i.type === 'equipment' && i.quantity > 0);
                if (equipmentItems.length > 0) {
                    console.log('Creating EquipmentRental for items:', equipmentItems);
                    
                    await EquipmentRental.create({
                        userId: bookingData.userId,
                        bookingId: booking._id,
                        equipments: equipmentItems.map(item => ({
                            equipmentId: item.productId,
                            quantity: item.quantity
                        })),
                        totalPrice: equipmentItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
                    });
                        // Giảm số lượng tồn kho thiết bị
                        for (const item of equipmentItems) {
                            console.log(`Decreasing equipment ${item.productId} by ${item.quantity}`);
                            await Equipment.findByIdAndUpdate(item.productId, { $inc: { quantity: -item.quantity } });
                            const updatedEquipment = await Equipment.findById(item.productId);
                            console.log(`Equipment ${item.productId} new quantity: ${updatedEquipment?.quantity}`);
                        }
                }
                // Đồ tiêu thụ
                const consumableItems = bookingData.items.filter(i => i.type === 'consumable' && i.quantity > 0);
                if (consumableItems.length > 0) {
                    console.log('Creating ConsumablePurchase for items:', consumableItems);
                    
                    await ConsumablePurchase.create({
                        userId: bookingData.userId,
                        bookingId: booking._id,
                        consumables: consumableItems.map(item => ({
                            consumableId: item.productId,
                            quantity: item.quantity
                        })),
                        totalPrice: consumableItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
                    });
                        // Giảm số lượng tồn kho đồ tiêu thụ
                        for (const item of consumableItems) {
                            console.log(`Decreasing consumable ${item.productId} by ${item.quantity}`);
                            await Consumable.findByIdAndUpdate(item.productId, { $inc: { quantityInStock: -item.quantity } });
                            const updatedConsumable = await Consumable.findById(item.productId);
                            console.log(`Consumable ${item.productId} new quantityInStock: ${updatedConsumable?.quantityInStock}`);
                        }
                }
            }
            // 3. Tạo payment (pending)
            console.log('Creating payment...');
            const payment = await Payment.create({
                bookingId: booking._id,
                userId: bookingData.userId,
                amount: bookingData.totalPrice,
                paymentMethod: 'vnpay',
                status: 'pending'
            });

            // 4. Tạo URL thanh toán VNPAY
            console.log('Creating VNPAY URL...');
            const vnpUrl = await this.createPaymentUrl(payment, req);
            console.log('VNPAY URL created:', vnpUrl);
            
            // 5. Lưu paymentUrl và expiry (15 phút) vào booking
            const expiryTime = new Date(Date.now() + 7 * 60 * 60 * 1000 + 15 * 60 * 1000); // UTC+7 + 15 phút
            await Booking.findByIdAndUpdate(booking._id, {
                paymentUrl: vnpUrl,
                paymentUrlExpiry: expiryTime
            });
            console.log('Payment URL saved to booking with 15min expiry');
            console.log('=== END createBookingAndPayment ===');

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
                // Nếu thanh toán thành công, cộng tiền vào ví admin
                if (responseData.vnp_ResponseCode === '00') {
                    const adminUser = await User.findOne({ role: 'ADMIN' });
                    if (adminUser) {
                        let adminWallet = await Wallet.findOne({ userId: adminUser._id });
                        if (!adminWallet) {
                            adminWallet = await Wallet.create({ userId: adminUser._id, balance: 0 });
                        }
                        adminWallet.balance += payment.amount;
                        await adminWallet.save();
                        await WalletTransaction.create({
                            walletId: adminWallet._id,
                            userId: adminUser._id,
                            type: 'receive',
                            amount: payment.amount,
                            status: 'completed',
                            description: `Nhận tiền booking #${payment.bookingId} từ khách hàng`,
                            relatedBookingId: payment.bookingId
                        });
                    }
                }

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
    async payBookingByWallet({ bookingId, userId, amount, items }) {
        console.log('=== START payBookingByWallet ===');
        console.log('Parameters:', { bookingId, userId, amount, items: JSON.stringify(items, null, 2) });
        const booking = await Booking.findById(bookingId);
        if (!booking) throw new Error('Booking không tồn tại');
        if (booking.status !== 'pending') throw new Error('Booking không hợp lệ để thanh toán');

        // Kiểm tra booking đã hết hạn chưa (nếu có expiry)
        if (booking.paymentUrlExpiry && new Date() > booking.paymentUrlExpiry) {
            booking.status = 'cancelled';
            await booking.save();
            await BookingService.releaseScheduleSlots(booking);
            throw new Error('Booking đã hết hạn thanh toán. Vui lòng đặt lại.');
        }
        // Thiết bị
        let equipmentRental = await EquipmentRental.findOne({ bookingId: booking._id });
        console.log('equipmentRental:', equipmentRental);
        // Nếu chưa có equipmentRental và có items truyền vào
        if (!equipmentRental && Array.isArray(items) && items.length > 0) {
            const equipmentItems = items.filter(i => i.type === 'equipment' && i.quantity > 0);
            if (equipmentItems.length > 0) {
                equipmentRental = await EquipmentRental.create({
                    userId,
                    bookingId: booking._id,
                    equipments: equipmentItems.map(item => ({
                        equipmentId: item.productId,
                        quantity: item.quantity
                    })),
                    totalPrice: equipmentItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
                });
            }
        }
        if (equipmentRental && equipmentRental.equipments) {
            for (const item of equipmentRental.equipments) {
                const equipment = await Equipment.findById(item.equipmentId);
               // console.log('Check equipment:', { item, equipment });
                if (!equipment) throw new Error(`Thiết bị không tồn tại: ${item.equipmentId}`);
                if (item.quantity > equipment.quantity) {
                    throw new Error(`Thiết bị '${equipment.name}' chỉ còn ${equipment.quantity}, bạn yêu cầu ${item.quantity}`);
                }
            }
        }
        // Đồ tiêu thụ
        let consumablePurchase = await ConsumablePurchase.findOne({ bookingId: booking._id });
       // console.log('consumablePurchase:', consumablePurchase);
        // Nếu chưa có consumablePurchase và có items truyền vào
        if (!consumablePurchase && Array.isArray(items) && items.length > 0) {
            const consumableItems = items.filter(i => i.type === 'consumable' && i.quantity > 0);
            if (consumableItems.length > 0) {
                consumablePurchase = await ConsumablePurchase.create({
                    userId,
                    bookingId: booking._id,
                    consumables: consumableItems.map(item => ({
                        consumableId: item.productId,
                        quantity: item.quantity
                    })),
                    totalPrice: consumableItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
                });
            }
        }
        if (consumablePurchase && consumablePurchase.consumables) {
            for (const item of consumablePurchase.consumables) {
                const consumable = await Consumable.findById(item.consumableId);
               // console.log('Check consumable:', { item, consumable });
                if (!consumable) throw new Error(`Đồ tiêu thụ không tồn tại: ${item.consumableId}`);
                if (item.quantity > consumable.quantityInStock) {
                    throw new Error(`Đồ tiêu thụ '${consumable.name}' chỉ còn ${consumable.quantity}, bạn yêu cầu ${item.quantity}`);
                }
            }
        }

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

        // Giảm số lượng tồn kho thiết bị
        if (equipmentRental && equipmentRental.equipments) {
            for (const item of equipmentRental.equipments) {
                await Equipment.findByIdAndUpdate(item.equipmentId, { $inc: { quantity: -item.quantity } });
                const updatedEquipment = await Equipment.findById(item.equipmentId);
                console.log(`Equipment ${item.equipmentId} new quantity: ${updatedEquipment?.quantity}`);
            }
        }
        // Giảm số lượng tồn kho đồ tiêu thụ
        if (consumablePurchase && consumablePurchase.consumables) {
            for (const item of consumablePurchase.consumables) {
                await Consumable.findByIdAndUpdate(item.consumableId, { $inc: { quantityInStock: -item.quantity } });
                const updatedConsumable = await Consumable.findById(item.consumableId);
                console.log(`Consumable ${item.consumableId} new quantityInStock: ${updatedConsumable?.quantityInStock}`);
            }
        }

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

    // Lấy payment URL từ booking để tiếp tục thanh toán
    async getPaymentUrlFromBooking(bookingId) {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return { success: false, message: 'Booking không tồn tại' };
        }
        
        // Kiểm tra trạng thái booking
        if (booking.status !== 'pending') {
            return { success: false, message: 'Booking không còn ở trạng thái chờ thanh toán' };
        }

        // Kiểm tra URL đã hết hạn chưa
        if (!booking.paymentUrl || !booking.paymentUrlExpiry) {
            return { success: false, message: 'Không tìm thấy link thanh toán' };
        }

        const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
        if (now > booking.paymentUrlExpiry) {
            return { success: false, message: 'Link thanh toán đã hết hạn. Vui lòng đặt lại.' };
        }

        return {
            success: true,
            paymentUrl: booking.paymentUrl,
            expiryTime: booking.paymentUrlExpiry,
            remainingMinutes: Math.ceil((booking.paymentUrlExpiry - now) / (1000 * 60))
        };
    }

    // Auto-cancel booking pending hết hạn (gọi từ cron job)
    async cancelExpiredPendingBookings() {
         const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
        const expiredBookings = await Booking.find({
            status: 'pending',
            paymentUrlExpiry: { $lt: now }
        });

        let cancelledCount = 0;
        for (const booking of expiredBookings) {
            try {
                booking.status = 'cancelled';
                await booking.save();
                await BookingService.releaseScheduleSlots(booking);
                
                // Hoàn lại tồn kho thiết bị/đồ tiêu thụ nếu có
                const equipmentRental = await EquipmentRental.findOne({ bookingId: booking._id });
                if (equipmentRental && equipmentRental.equipments) {
                    for (const item of equipmentRental.equipments) {
                        await Equipment.findByIdAndUpdate(item.equipmentId, { 
                            $inc: { quantity: item.quantity } 
                        });
                    }
                }

                const consumablePurchase = await ConsumablePurchase.findOne({ bookingId: booking._id });
                if (consumablePurchase && consumablePurchase.consumables) {
                    for (const item of consumablePurchase.consumables) {
                        await Consumable.findByIdAndUpdate(item.consumableId, { 
                            $inc: { quantity: item.quantity } 
                        });
                    }
                }

                cancelledCount++;
            } catch (error) {
                console.error(`Error cancelling booking ${booking._id}:`, error);
            }
        }

        return { cancelledCount, totalExpired: expiredBookings.length };
    }
}

module.exports = new PaymentService();