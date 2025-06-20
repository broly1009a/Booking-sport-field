const mongoose = require('mongoose');
const { Schema } = mongoose;

const equipmentRentalSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User ID is required!"]
    },
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
        required: false
    },
    equipments: [
        {
            equipmentId: {
                type: Schema.Types.ObjectId,
                ref: 'Equipment',
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
        enum: ['pending', 'rented', 'returned'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model("EquipmentRental", equipmentRentalSchema);