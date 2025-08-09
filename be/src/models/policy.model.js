const mongoose = require('mongoose');
const { Schema } = mongoose;

const policySchema = new Schema({
    categoryPolicyId: {
        type: Schema.Types.ObjectId,
        ref: 'CategoryPolicy',
        required: true
    },
    content: {
        type: String,
        default: "",
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Policy", policySchema);