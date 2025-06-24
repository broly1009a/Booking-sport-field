const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
        required: false // Có thể không có khi nạp ví
    },
    amount: {
        type: Number,
        required: true
    },
    bankCode: String,
    description: String, // Mô tả giao dịch (VD: "Thanh toán đặt sân", "Nạp tiền vào ví")
    type: {
        type: String,
        enum: ['booking', 'topup'],
        required: true
    },
    language: String,
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Success', 'Failed'],
        default: 'Pending'
    },
    paymentTime: Date
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);