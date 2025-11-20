const User = require('../models/user.model');
const SportField = require('../models/sportField.model');
const Booking = require('../models/booking.model');
const WalletTransaction = require('../models/walletTransaction.model');
const Complex = require('../models/fieldComplex.model');
const Event = require('../models/event.model');
const Payment = require('../models/payment.model');
const Wallet = require('../models/wallet.model');
class StatisticsService {

                /**
                 * Thống kê cho staff (các cụm sân staff được giao)
                 * @param {String} staffId - id của staff
                 * @param {Object} param1 - {from, to} ngày lọc
                 */
                async getStaffStats(staffId, { from, to }) {
                    // Lấy danh sách complex mà staff được giao
                    const complexes = await Complex.find({ staffs: staffId });
                    const complexIds = complexes.map(c => c._id);
                    // Lấy danh sách sân thuộc các complex
                    const fields = await SportField.find({ complex: { $in: complexIds } });
                    const fieldIds = fields.map(f => f._id);

                    // Filter ngày
                    let dateFilter = {};
                    if (from || to) {
                        dateFilter.createdAt = {};
                        if (from) dateFilter.createdAt.$gte = new Date(from);
                        if (to) dateFilter.createdAt.$lte = new Date(to);
                    }

                    // Booking của các sân staff
                    const bookings = await Booking.find({ fieldId: { $in: fieldIds }, ...dateFilter });
                    const totalBookings = bookings.length;
                    const bookingStatusCounts = bookings.reduce((acc, b) => {
                        acc[b.status] = (acc[b.status] || 0) + 1;
                        return acc;
                    }, {});

                    // Event của các sân staff
                    const events = await Event.find({ fieldId: { $in: fieldIds }, ...dateFilter });
                    const totalEvents = events.length;
                    const eventStatusCounts = events.reduce((acc, e) => {
                        acc[e.status] = (acc[e.status] || 0) + 1;
                        return acc;
                    }, {});

                    // Doanh thu từ payment liên quan booking của staff
                    const payments = await Payment.find({ bookingId: { $in: bookings.map(b => b._id) }, status: 'completed', ...dateFilter });
                    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

                    return {
                        totalFields: fieldIds.length,
                        totalBookings,
                        bookingStatusCounts,
                        totalEvents,
                        eventStatusCounts,
                        totalRevenue
                    };
                }
            /**
             * Lấy danh sách cần thanh toán tiền hàng tháng cho chủ sân
             * @param {String} ownerId
             * @param {Object} param1 - {month, year}
             */
            async getOwnerMonthlyPayoutList(ownerId, { month, year }) {
                // Nếu ownerId rỗng, trả về danh sách cho tất cả owner
                let ownerIds = [];
                if (!ownerId) {
                    ownerIds = await Complex.distinct('owner');
                } else {
                    ownerIds = [ownerId];
                }
                // Tính khoảng thời gian tháng
                let from, to;
                if (month && year) {
                    from = new Date(year, month - 1, 1, 0, 0, 0);
                    to = new Date(year, month, 0, 23, 59, 59); // ngày cuối tháng
                } else {
                    const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
                    from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
                    to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
                }
                let result = [];
                for (const oid of ownerIds) {
                    const complexes = await Complex.find({ owner: oid });
                    const complexIds = complexes.map(c => c._id);
                    const fields = await SportField.find({ complex: { $in: complexIds } });
                    const fieldIds = fields.map(f => f._id);
                    const bookings = await Booking.find({
                        fieldId: { $in: fieldIds },
                        status: 'confirmed',
                        createdAt: { $gte: from, $lte: to }
                    });
                    const payments = await Payment.find({
                        bookingId: { $in: bookings.map(b => b._id) },
                        status: 'completed',
                        paymentTime: { $gte: from, $lte: to }
                    });
                    const totalPayout = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
                    const payoutList = payments.map(p => ({
                        bookingId: p.bookingId,
                        amount: p.amount,
                        paymentMethod: p.paymentMethod,
                        paymentTime: p.paymentTime
                    }));
                    // Truy vấn thông tin chủ sân
                    let ownerInfo = await User.findById(oid).lean();
                    result.push({
                        ownerId: oid,
                        ownerName: `${ownerInfo?.fname || ""} ${ownerInfo?.lname || ""}`,
                        ownerEmail: ownerInfo?.email || "",
                        ownerPhone: ownerInfo?.phoneNumber || "",
                        month: from.getMonth() + 1,
                        year: from.getFullYear(),
                        totalPayout,
                        payoutList
                    });
                }
                // Nếu truyền ownerId thì trả về object, nếu không thì trả về mảng
                return !ownerId ? result : result[0];
            }
        /**
         * Thống kê cho chủ sân (owner)
         * @param {String} ownerId - id của chủ sân
         * @param {Object} param1 - {from, to} ngày lọc
         */
        async getOwnerStats(ownerId, { from, to }) {
            // Lấy danh sách complex của owner (đúng trường owner)
            const complexes = await Complex.find({ owner: ownerId });
            // console.log('Complexes:', complexes);
            const complexIds = complexes.map(c => c._id);
            // Lấy danh sách sân thuộc các complex
            const fields = await SportField.find({ complex: { $in: complexIds } });
            // console.log('Fields:', fields);
            const fieldIds = fields.map(f => f._id);

            // Filter ngày
            let dateFilter = {};
            if (from || to) {
                dateFilter.createdAt = {};
                if (from) dateFilter.createdAt.$gte = new Date(from);
                if (to) dateFilter.createdAt.$lte = new Date(to);
            }

            // Booking của các sân owner
            const bookings = await Booking.find({ fieldId: { $in: fieldIds }, ...dateFilter });
            // console.log('Bookings:', bookings);
            const totalBookings = bookings.length;
            const bookingStatusCounts = bookings.reduce((acc, b) => {
                acc[b.status] = (acc[b.status] || 0) + 1;
                return acc;
            }, {});

            // Event của các sân owner
            const events = await Event.find({ fieldId: { $in: fieldIds }, ...dateFilter });
            // console.log('Events:', events);
            const totalEvents = events.length;
            const eventStatusCounts = events.reduce((acc, e) => {
                acc[e.status] = (acc[e.status] || 0) + 1;
                return acc;
            }, {});

            // Doanh thu từ payment liên quan booking của owner
            const payments = await Payment.find({ bookingId: { $in: bookings.map(b => b._id) }, status: 'completed', ...dateFilter });
            // console.log('Payments:', payments);
            const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

            // Số dư ví của owner
            const ownerWallet = await Wallet.findOne({ userId: ownerId });
            // console.log('OwnerWallet:', ownerWallet);
            const walletBalance = ownerWallet ? ownerWallet.balance : 0;

            return {
                totalFields: fieldIds.length,
                totalBookings,
                bookingStatusCounts,
                totalEvents,
                eventStatusCounts,
                totalRevenue,
                walletBalance
            };
        }
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