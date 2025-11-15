const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    // Người nhận
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Tiêu đề
    title: {
        type: String,
        required: true
    },
    
    // Nội dung
    message: {
        type: String,
        required: true
    },
    
    // Loại (tùy chọn)
    type: {
        type: String,
        default: 'info'
    },
    
    // Đã đọc chưa
    isRead: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true
});

// Index
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
