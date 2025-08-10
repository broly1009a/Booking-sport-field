import api from '../index';
import { handleApiCall } from '../../utils/handleApi';

class CouponService {
  async getAllCoupons() {
    return handleApiCall(() => api.get('/coupon'));
  }
  async createCoupon(data) {
    return handleApiCall(() => api.post('/coupon', data));
  }
  async updateCoupon(id, data) {
    return handleApiCall(() => api.put(`/coupon/${id}`, data));
  }
  async deleteCoupon(id) {
    return handleApiCall(() => api.delete(`/coupon/${id}`));
  }
  async validateCoupon({ code, total }) {
    return handleApiCall(() => api.post('/coupon/validate', { code, total }));
  }
}

export default new CouponService();