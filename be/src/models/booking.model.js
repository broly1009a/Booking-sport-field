const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookingSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User ID is required!"]
    },
    bookingType: {
        type: String,
        enum: ['private', 'shared'],
        default: 'private'
    },
    fieldId: {
        type: Schema.Types.ObjectId,
        ref: 'SportField',
        required: [true, "Field ID is required!"]
    },
    requiredSlots: {
        type: Number,
        default: 1,
        min: 1
    },
    maxParticipants: {
        type: Number,
        default: 4
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
    },
    joinDeadline: {
        type: Date
    },
    pricePerSlot: {
        type: Number,
        min: 0
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    participantDetails: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'refunded'],
            default: 'pending'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });
module.exports = mongoose.model("Booking", bookingSchema);


