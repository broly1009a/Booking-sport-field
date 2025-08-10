const CouponService = require('../services/coupon.service');

class CouponController {
    async createCoupon(req, res, next) {
        try {
            const coupon = await CouponService.createCoupon(req.body);
            res.status(201).json({ success: true, coupon });
        } catch (error) {
            next(error);
        }
    }

    async getAllCoupons(req, res, next) {
        try {
            const coupons = await CouponService.getAllCoupons();
            res.status(200).json({ success: true, coupons });
        } catch (error) {
            next(error);
        }
    }

    async getCouponByCode(req, res, next) {
        try {
            const { code } = req.params;
            const coupon = await CouponService.getCouponByCode(code);
            if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found or expired' });
            res.status(200).json({ success: true, coupon });
        } catch (error) {
            next(error);
        }
    }

    async updateCoupon(req, res, next) {
        try {
            const { id } = req.params;
            const coupon = await CouponService.updateCoupon(id, req.body);
            res.status(200).json({ success: true, coupon });
        } catch (error) {
            next(error);
        }
    }

    async deleteCoupon(req, res, next) {
        try {
            const { id } = req.params;
            await CouponService.deleteCoupon(id);
            res.status(200).json({ success: true, message: 'Coupon deleted' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CouponController();
