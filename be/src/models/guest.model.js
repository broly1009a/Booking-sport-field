const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Tên là bắt buộc."],
        minLength: [3, "Tên phải có ít nhất 3 ký tự."],
        maxLength: [100, "Tên không được quá 100 ký tự."]
    },
    phoneNumber: {
        type: String,
        required: [true, "Số điện thoại là bắt buộc."],
    },
    email: {
        type: String,
        validate: {
            validator: function (value) {
                return !value || /^\S+@\S+\.\S+$/.test(value);
            },
            message: "Email không hợp lệ."

        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Guest', guestSchema);
