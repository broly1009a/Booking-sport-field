const mongoose = require('mongoose');
const { Schema } = mongoose;

const walletTransactionSchema = new Schema({
  walletId: {
    type: Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'payment', 'refund'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  description: String,
  relatedBookingId: {
    type: Schema.Types.ObjectId,
    ref: 'Booking'
  },
  vnpayUrl: {
    type: String,
    required: false, // Lưu URL trả về từ VNPay nếu có
  }
}, { timestamps: true });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);