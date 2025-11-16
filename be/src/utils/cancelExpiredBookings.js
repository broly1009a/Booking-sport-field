const cron = require('node-cron');
const PaymentService = require('../services/payment.service');

// Chạy mỗi 5 phút để hủy booking pending hết hạn
const cancelExpiredBookings = async () => {
    try {
        console.log('[CRON] Running cancelExpiredBookings job...');
        const result = await PaymentService.cancelExpiredPendingBookings();
        console.log(`[CRON] Cancelled ${result.cancelledCount}/${result.totalExpired} expired bookings`);
    } catch (error) {
        console.error('[CRON] Error in cancelExpiredBookings:', error);
    }
};

// Đăng ký cron job với schedule
const registerCancelExpiredBookingsCron = () => {
    cron.schedule('*/5 * * * *', cancelExpiredBookings);
    console.log('✅ Cron job: Auto-cancel expired bookings registered (every 5 minutes)');
};

module.exports = { registerCancelExpiredBookingsCron };
