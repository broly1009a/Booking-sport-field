const mongoose = require('mongoose');
const { Schema } = mongoose;

const couponSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['percent', 'amount'], // percent: giảm theo %, amount: giảm số tiền
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    minOrderValue: {
        type: Number,
        default: 0 // đơn hàng tối thiểu để áp dụng
    },
    maxDiscount: {
        type: Number,
        default: null // số tiền giảm tối đa (nếu là percent)
    },
    productIds: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }], // Áp dụng cho các sản phẩm cụ thể (nếu có)
    usageLimit: {
        type: Number,
        default: null // số lần sử dụng tối đa
    },
    usedCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiryDate: {
        type: Date,
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
