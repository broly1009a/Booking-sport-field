
const mongoose = require('mongoose');
const { Schema } = mongoose;

const consumableSchema = new Schema({
    name: {
        type: String,
        required: [true, "Consumable name is required!"],
        minLength: 1,
        maxLength: 100
    },
    type: {
        type: String,
        enum: ['water', 'snack', 'meal', 'beverage'],
        required: [true, "Consumable type is required!"]
    },
    pricePerUnit: {
        type: Number,
        required: [true, "Price per unit is required!"],
        min: 0
    },
    quantityInStock: {
        type: Number,
        required: [true, "Quantity in stock is required!"],
        min: 0
    },
    status: {
        type: String,
        enum: ['available', 'out_of_stock'],
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

module.exports = mongoose.model("Consumable", consumableSchema);