const mongoose = require('mongoose');
const { Schema } = mongoose;
const consumablePurchaseSchema = new Schema({
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User ID is required!"]
    },
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
        required: false // Optional reference to Booking
    },
    consumables: [
        {
            consumableId: {
                type: Schema.Types.ObjectId,
                ref: 'Consumable',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: [true, "Total price is required!"],
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model("ConsumablePurchase", consumablePurchaseSchema);