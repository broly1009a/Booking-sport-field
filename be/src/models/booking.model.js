const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookingSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User ID is required!"]
    },
    fieldId: {
        type: Schema.Types.ObjectId,
        ref: 'SportField',
        required: [true, "Field ID is required!"]
    },
    startTime: {
        type: Date,
        required: [true, "Start time is required!"]
    },
    endTime: {
        type: Date,
        required: [true, "End time is required!"]
    },
    status: {
        type: String,
        enum: ['pending', 'waiting', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    totalPrice: {
        type: Number,
        required: [true, "Total price is required!"],
        min: 0
    },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
    ],
    customerName: {
        type: String,
        required: [true, "Customer name is required!"]
    },
    phoneNumber: {
        type: String,
        required: [true, "Customer phone is required!"]
    },
    notes: {
        type: String,
        default: ''
    }
}, { timestamps: true });
module.exports = mongoose.model("Booking", bookingSchema);


