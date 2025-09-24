const mongoose = require('mongoose');
const { Schema } = mongoose;

const deletedSportFieldSchema = new Schema({
    originalId: {
        type: Schema.Types.ObjectId,
        ref: 'SportField',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: Schema.Types.ObjectId,
        ref: 'Type',
        required: true
    },
    location: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'maintenance', 'booked'],
        required: true
    },
    pricePerHour: {
        type: Number,
        required: true
    },
    amenities: {
        type: [String],
        default: []
    },
    images: {
        type: [String],
        default: []
    },
    deletedAt: {
        type: Date,
        default: Date.now
    },
    deletedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model('DeletedSportField', deletedSportFieldSchema);
