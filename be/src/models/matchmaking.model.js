const mongoose = require('mongoose');
const { Schema } = mongoose;

const matchmakingSchema = new Schema({
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
        required: [true, "Booking ID is required!"]
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
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Creator ID is required!"]
    },
    playerLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'any'],
        default: 'any'
    },
    playStyle: {
        type: String,
        enum: ['casual', 'competitive', 'any'],
        default: 'any'
    },
    teamPreference: {
        type: String,
        enum: ['any', 'male', 'female', 'mixed'],
        default: 'any'
    },
    availableSlots: {
        type: Number,
        min: 1,
        max: 4,
        required: true
    },
    interestedPlayers: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        requestedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['open', 'full', 'cancelled', 'completed'],
        default: 'open'
    },
    description: {
        type: String,
        default: ''
    },
    deadline: {
        type: Date,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Matchmaking", matchmakingSchema);
