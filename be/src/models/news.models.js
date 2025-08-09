const mongoose = require('mongoose');
const { Schema } = mongoose;

const newsSchema = new Schema({
    title: {
        type: String,
        required: [true, "Tiêu đề bắt buộc!"]
    },
    content: {
        type: String,
        required: [true, "Nội dung bắt buộc!"]
    },
    image: {
        type: String, // URL ảnh
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
}, { timestamps: true }); // Tự động thêm createdAt & updatedAt

module.exports = mongoose.model('News', newsSchema);