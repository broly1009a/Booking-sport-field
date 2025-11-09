const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentSchema = new Schema({
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
         required: false
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User ID is required!"]
    },
    amount: {
        type: Number,
        required: [true, "Amount is required!"],
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: ['vnpay', 'wallet', 'cash'],
        required: [true, "Payment method is required!"]
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    transactionId: {
        type: String,
        required: false // Chỉ cần khi thanh toán qua cổng thanh toán
    },
    vnpayUrl: {
        type: String,
        required: false, // Lưu URL trả về từ VNPay nếu có
    },
    paymentTime: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);