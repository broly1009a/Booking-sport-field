const Coupon = require('../models/coupon.model');

class CouponService {
    async createCoupon(data) {
        const coupon = new Coupon(data);
        return await coupon.save();
    }

    async getAllCoupons() {
        return await Coupon.find();
    }

    async getCouponByCode(code) {
        return await Coupon.findOne({ code: code.toUpperCase(), isActive: true, expiryDate: { $gt: new Date() } });
    }

    async updateCoupon(id, data) {
        return await Coupon.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteCoupon(id) {
        return await Coupon.findByIdAndDelete(id);
    }

    async incrementUsedCount(id) {
        return await Coupon.findByIdAndUpdate(id, { $inc: { usedCount: 1 } }, { new: true });
    }
}

module.exports = new CouponService();
