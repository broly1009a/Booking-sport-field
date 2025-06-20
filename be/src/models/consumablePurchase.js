// "ConsumablePurchase": {
//   "description": "Lưu trữ thông tin về các giao dịch mua mặt hàng tiêu thụ",
//   "schema": {
//     "_id": "ObjectId",
//     "userId": "ObjectId (tham chiếu đến User)",
//     "consumableId": "ObjectId (tham chiếu đến Consumable)",
//     "bookingId": "ObjectId (tham chiếu đến Booking, tùy chọn)",
//     "quantity": "Number",
//     "totalPrice": "Number",
//     "status": "String (enum: ['pending', 'completed', 'cancelled'])",
//     "createdAt": "Date",
//     "updatedAt": "Date"
//   }
// }

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