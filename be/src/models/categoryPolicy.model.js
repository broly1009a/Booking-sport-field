const mongoose = require('mongoose');
const { Schema } = mongoose;

const categoryPolicySchema = new Schema({
    title: {
        type: String,
        default: "",
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("CategoryPolicy", categoryPolicySchema);