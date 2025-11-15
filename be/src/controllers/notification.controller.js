const notificationService = require('../services/notification.service');

class NotificationController {
    // Lấy danh sách
    async getList(req, res) {
        try {
            const userId = req.user._id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;

            const result = await notificationService.getList(userId, page, limit);
            
            return res.json({ success: true, data: result });
        } catch (error) {
            console.error('[Notification Controller] Lỗi:', error);
            return res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // Đánh dấu đã đọc
    async markRead(req, res) {
        try {
            const userId = req.user._id;
            const notificationId = req.params.id;

            await notificationService.markRead(notificationId, userId);
            
            return res.json({ success: true, message: 'Đã đánh dấu đọc' });
        } catch (error) {
            console.error('[Notification Controller] Lỗi:', error);
            return res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // Đánh dấu tất cả đã đọc
    async markAllRead(req, res) {
        try {
            const userId = req.user._id;
            await notificationService.markAllRead(userId);
            
            return res.json({ success: true, message: 'Đã đánh dấu tất cả' });
        } catch (error) {
            console.error('[Notification Controller] Lỗi:', error);
            return res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // Xóa
    async delete(req, res) {
        try {
            const userId = req.user._id;
            const notificationId = req.params.id;

            await notificationService.delete(notificationId, userId);
            
            return res.json({ success: true, message: 'Đã xóa' });
        } catch (error) {
            console.error('[Notification Controller] Lỗi:', error);
            return res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }

    // Xóa đã đọc
    async deleteRead(req, res) {
        try {
            const userId = req.user._id;
            await notificationService.deleteRead(userId);
            
            return res.json({ success: true, message: 'Đã xóa tất cả đã đọc' });
        } catch (error) {
            console.error('[Notification Controller] Lỗi:', error);
            return res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }
}

module.exports = new NotificationController();
