import api from '../index';
import { handleApiCall } from '../../utils/handleApi';

export const paymentService = {
    // Đặt sân và thanh toán online
    createBookingAndPayment: (bookingData) =>
        handleApiCall(() => api.post('/payment/booking', bookingData)),

    // Nạp tiền vào ví
    topUpWallet: (topUpData) =>
        handleApiCall(() => api.post('/payment/topup', topUpData)),

    // Callback VNPAY (thường dùng ở BE, FE chỉ redirect hoặc lấy trạng thái)
    getVnpayReturn: (params) =>
        handleApiCall(() => api.get('/payment/vnpay-return', { params })),

    // Thanh toán booking bằng ví
    payBookingByWallet: (walletData) =>
        handleApiCall(() => api.post('/payment/wallet', walletData)),
    // Lấy booking theo paymentId
    getBookingByPaymentId: (paymentId) =>
        handleApiCall(() => api.get(`/payment/booking-by-payment/${paymentId}`)),
    
};

