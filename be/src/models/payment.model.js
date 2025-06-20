const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentSchema = new Schema({
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
        required: [true, "Booking ID is required!"]
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
        enum: ['cash', 'card', 'mobile', 'bank_transfer'],
        required: [true, "Payment method is required!"]
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    transactionId: {
        type: String,
        unique: true
    }
}, { timestamps: true });
