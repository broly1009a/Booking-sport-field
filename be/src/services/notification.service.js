const Notification = require('../models/notification.model');
const FieldComplex = require('../models/fieldComplex.model');

class NotificationService {
    // Tạo thông báo đơn giản
    async create(userId, title, message, type = 'info') {
        try {
            const notification = await Notification.create({
                userId,
                title,
                message,
                type
            });
            return notification;
        } catch (error) {
            console.error('[Notification] Lỗi tạo:', error);
            throw error;
        }
    }

    // Gửi cho owner và staff của cơ sở
    async notifyFieldComplex(fieldComplexId, title, message, type = 'info') {
        try {
            const complex = await FieldComplex.findById(fieldComplexId)
                .populate('owner', '_id')
                .populate('staffs', '_id');

            if (!complex) return;

            const userIds = [];
            if (complex.owner) userIds.push(complex.owner._id);
            if (complex.staffs) {
                complex.staffs.forEach(staff => userIds.push(staff._id));
            }

            await Promise.all(
                userIds.map(userId => this.create(userId, title, message, type))
            );
        } catch (error) {
            console.error('[Notification] Lỗi gửi:', error);
        }
    }

    // Lấy danh sách
    async getList(userId, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            
            const [notifications, total, unreadCount] = await Promise.all([
                Notification.find({ userId })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Notification.countDocuments({ userId }),
                Notification.countDocuments({ userId, isRead: false })
            ]);

            return {
                notifications,
                total,
                unreadCount,
                page,
                totalPages: Math.ceil(total / limit)
            };
        } catch (error) {
            console.error('[Notification] Lỗi lấy danh sách:', error);
            throw error;
        }
    }

    // Đánh dấu đã đọc
    async markRead(notificationId, userId) {
        try {
            await Notification.updateOne(
                { _id: notificationId, userId },
                { $set: { isRead: true } }
            );
        } catch (error) {
            console.error('[Notification] Lỗi đánh dấu đọc:', error);
            throw error;
        }
    }

    // Đánh dấu tất cả đã đọc
    async markAllRead(userId) {
        try {
            await Notification.updateMany(
                { userId, isRead: false },
                { $set: { isRead: true } }
            );
        } catch (error) {
            console.error('[Notification] Lỗi đánh dấu tất cả:', error);
            throw error;
        }
    }

    // Xóa
    async delete(notificationId, userId) {
        try {
            await Notification.deleteOne({ _id: notificationId, userId });
        } catch (error) {
            console.error('[Notification] Lỗi xóa:', error);
            throw error;
        }
    }

    // Xóa đã đọc
    async deleteRead(userId) {
        try {
            await Notification.deleteMany({ userId, isRead: true });
        } catch (error) {
            console.error('[Notification] Lỗi xóa đã đọc:', error);
            throw error;
        }
    }
}

module.exports = new NotificationService();
