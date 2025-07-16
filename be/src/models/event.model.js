
const mongoose = require('mongoose');
const { Schema } = mongoose;

const eventSchema = new Schema({
    name: {
        type: String,
        required: [true, "Event name is required!"],
        minLength: 1,
        maxLength: 100
    },
    description: {
        type: String,
        required: [true, "Event description is required!"],
        minLength: 1,
        maxLength: 500
    },
    image: {
        type: String,
        minLength: 1,
        maxLength: 500
    },
    fieldId: {
        type: Schema.Types.ObjectId,
        ref: 'SportField',
        required: [true, "Sport field is required!"]
    },
    organizerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Organizer is required!"]
    },
    startTime: {
        type: Date,
        required: [true, "Event start time is required!"]
    },
    endTime: {
        type: Date,
        required: [true, "Event end time is required!"]
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed'],
        default: 'upcoming'
    },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });
module.exports = mongoose.model("Event", eventSchema);

