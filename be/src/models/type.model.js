const mongoose = require('mongoose');
const { Schema } = mongoose;

const typeSchema = new Schema({
    name: {
        type: String,
        uniqe: [true, "Type name must be unique !"],
        required: [true, "Type name must require !"],
        minLength: 0,
        maxLength: 20
    },
    description: {
        type: String,
        default: "",
        minLength: 0,
        maxLength: 200
    },
    thumbnails: String
}, { timestamps: true });

module.exports = mongoose.model("Type", typeSchema);
