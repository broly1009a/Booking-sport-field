const mongoose = require('mongoose');
const { Schema } = mongoose;

const feedbackSchema = new Schema({
    fieldId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },  
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
