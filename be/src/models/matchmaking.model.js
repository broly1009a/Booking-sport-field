const mongoose = require('mongoose');
const { Schema } = mongoose;

const matchmakingSchema = new Schema({
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
    requiredPlayers: {
        type: Number,
        required: true,
        min: [1, "At least 1 player is needed for matchmaking"]
    },
    representativeId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    joinedPlayers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['open', 'full', 'cancelled'],
        default: 'open'
    }
}, { timestamps: true });

module.exports = mongoose.model("Matchmaking", matchmakingSchema);
