const express = require('express');
const router = express.Router();
const CouponController = require('../../../controllers/coupon.controller');

router.post('/', CouponController.createCoupon);
router.get('/', CouponController.getAllCoupons);
router.get('/:code', CouponController.getCouponByCode);
router.put('/:id', CouponController.updateCoupon);
router.delete('/:id', CouponController.deleteCoupon);

module.exports = router;
