const mongoose = require('mongoose');
const { Schema } = mongoose;

const removeAscent = (str) => {
    if (str === null || str === undefined) return str;
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    return str;
}


const userSchema = new Schema({
    fname: {
        type: String,
        required: [true, "Tên là bắt buộc."],
        minLength: [2, "Tên phải có ít nhất 2 ký tự."],
        maxLength: [50, "Tên không được quá 50 ký tự."],
        validate: {
            validator: function (value) {
                const regex = /^[a-zA-Z\s]*$/;
                return regex.test(removeAscent(value));
            },
            message: "Tên chỉ được chứa các ký tự chữ cái và dấu cách."
        }
    },
    lname: {
        type: String,
        required: [true, "Họ là bắt buộc."],
        minLength: [2, "Họ phải có ít nhất 2 ký tự."],
        maxLength: [50, "Họ không được quá 50 ký tự."],
        validate: {
            validator: function (value) {
                const regex = /^[a-zA-Z\s]*$/;
                return regex.test(removeAscent(value));
            },
            message: "Họ chỉ được chứa các ký tự chữ cái và dấu cách."
        }
    },
    dob: {
        type: Date,
        required: [true, "Ngày sinh là bắt buộc."],
        validate: {
            validator: function (value) {
                return value < new Date();
            },
            message: "Ngày sinh không hợp lệ."
        }
    },
    phoneNumber: {
        type: String,
        required: [true, "Số điện thoại là bắt buộc."],
    },
    email: {
        type: String,
        required: [true, "Email là bắt buộc."],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (value) {
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return regex.test(value);
            },
            message: "Email không hợp lệ."
        }
    },
    gender: {
        type: String,
        enum: {
            values: ['MALE', 'FEMALE', 'OTHER'],
            message: "Giới tính phải là một trong các giá trị: MALE, FEMALE, OTHER."
        },
        default: 'MALE',
        required: [true, "Giới tính là bắt buộc."]
    },
    firebaseUID: {
        type: String,
        unique: [true, "Firebase UID phải là duy nhất."],
        required: [true, "Firebase UID là bắt buộc."],
    },
    role: {
        type: String,
        enum: {
            values: ['CUSTOMER', 'STAFF', 'MANAGER', 'ADMIN'],
            message: "Role phải là một trong các giá trị: CUSTOMER, STAFF, MANAGER, ADMIN."
        },
        required: [true, "Role là bắt buộc."]
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);