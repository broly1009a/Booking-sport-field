// Blacklist : {
//   "description": "Lưu trữ danh sách người dùng bị cấm đặt chỗ do vi phạm quy định",
//   "schema": {
//     "_id": "ObjectId",
//     "userId": "ObjectId (tham chiếu đến User)",
//     "reason": "String",
//     "startDate": "Date",
//     "endDate": "Date",
//     "createdAt": "Date",
//     "updatedAt": "Date"
//   }
// }

const mongoose = require('mongoose');
const { Schema } = mongoose;

const blacklistSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User ID is required!"]
    },
    reason: {
        type: String,
        required: [true, "Reason for blacklisting is required!"]
    },
    startDate: {
        type: Date,
        required: [true, "Start date is required!"]
    },
    endDate: {
        type: Date,
        required: [true, "End date is required!"]
    }
}, { timestamps: true });

module.exports = mongoose.model("Blacklist", blacklistSchema);