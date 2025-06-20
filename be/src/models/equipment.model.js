
const mongoose = require('mongoose');
const { Schema } = mongoose;

const equipmentSchema = new Schema({
    name: {
        type: String,
        required: [true, "Equipment name is required!"],
        minLength: 1,
        maxLength: 100
    },
    type: {
        type: String,
        enum: ['ball', 'racket', 'net', 'goal'],
        required: [true, "Equipment type is required!"]
    },
    quantity: {
        type: Number,
        required: [true, "Quantity is required!"],
        min: 0
    },
    pricePerUnit: {
        type: Number,
        required: [true, "Price per unit is required!"],
        min: 0
    },
    status: {
        type: String,
        enum: ['available', 'rented', 'maintenance'],
        default: 'available'
    },
    sportField: [
        {
            type: Schema.Types.ObjectId,
            ref: 'SportField',
            required: [true, "Sport field is required!"]
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("Equipment", equipmentSchema);



