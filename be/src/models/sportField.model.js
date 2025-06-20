const mongoose = require('mongoose');
const { Schema } = mongoose;

const sportFieldSchema = new Schema({
    name: {
        type: String,
        required: [true, "Field name is required!"],
        minLength: 1,
        maxLength: 100
    },
    type: {
        type: Schema.Types.ObjectId,
        ref: 'Type',
        required: [true, "Field type is required!"]
    },
    location: {
        type: String,
        required: [true, "Location is required!"],
        minLength: 1,
        maxLength: 200
    },
    capacity: {
        type: Number,
        required: [true, "Capacity is required!"],
        min: 1
    },
    status: {
        type: String,
        enum: ['available', 'maintenance', 'booked'],
        default: 'available'
    },
    pricePerHour: {
        type: Number,
        required: [true, "Price per hour is required!"],
        min: 0
    },
    amenities: {
        type: [String],
        default: []
    },
    images: {
        type: [String],
        default: []
    },
    isdeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("SportField", sportFieldSchema);