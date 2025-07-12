const User = require('../models/user.model');
const SportField = require('../models/sportField.model');
const Booking = require('../models/booking.model');
const WalletTransaction = require('../models/walletTransaction.model');

class StatisticsService {
    async getDashboardStats({ from, to }) {
        // Xử lý filter ngày
        let dateFilter = {};
        if (from || to) {
            dateFilter.createdAt = {};
            if (from) dateFilter.createdAt.$gte = new Date(from);
            if (to) dateFilter.createdAt.$lte = new Date(to);
        }

        // Booking theo ngày/tháng
        const bookingsByDay = await Booking.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Doanh thu theo ngày/tháng
        const revenueByDay = await WalletTransaction.aggregate([
            { $match: { ...dateFilter, status: 'completed', type: { $in: ['payment', 'deposit', 'topup'] } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Tổng hợp số liệu tổng quan
        const [
            totalUsers,
            totalFields,
            totalBookings,
            totalRevenue,
            bookingStatusCounts,
            walletStats,
        ] = await Promise.all([
            User.countDocuments(),
            SportField.countDocuments(),
            Booking.countDocuments(dateFilter),
            WalletTransaction.aggregate([
                { $match: { ...dateFilter, status: 'completed', type: { $in: ['payment', 'deposit', 'topup'] } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Booking.aggregate([
                { $match: dateFilter },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            WalletTransaction.aggregate([
                { $match: dateFilter },
                { $group: { _id: '$type', count: { $sum: 1 }, total: { $sum: '$amount' } } }
            ]),
        ]);

        return {
            totalUsers,
            totalFields,
            totalBookings,
            totalRevenue: totalRevenue[0]?.total || 0,
            bookingStatusCounts,
            walletStats,
            chart: {
                bookingsByDay,
                revenueByDay
            }
        };
    }
}

module.exports = new StatisticsService();