
const mongoose = require('mongoose');
const { Schema } = mongoose;

const scheduleSchema = new Schema({
    fieldId: {
        type: Schema.Types.ObjectId,
        ref: 'SportField',
        required: [true, "Field ID is required!"]
    },
    date: {
        type: Date,
        required: [true, "Date is required!"]
    },
    timeSlots: [{
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
            enum: ['available', 'booked', 'maintenance'],
            default: 'available'
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model("Schedule", scheduleSchema);