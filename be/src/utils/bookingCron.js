const cron = require('node-cron');
const pickleballBookingService = require('../services/pickleballBooking.service');

// Chạy mỗi giờ để kiểm tra các booking hết hạn
const initBookingTimeoutCron = () => {
    cron.schedule('0 * * * *', async () => {
        try {
            console.log('Running booking timeout check...');
            await pickleballBookingService.handleBookingTimeout();
        } catch (error) {
            console.error('Error in booking timeout cron:', error);
        }
    });
};

module.exports = {
    initBookingTimeoutCron
};