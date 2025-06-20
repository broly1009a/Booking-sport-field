const mongoose = require('mongoose');
const { Schema } = mongoose;

const maintenanceSchema = new Schema({
    fieldId: {
        type: Schema.Types.ObjectId,
        ref: 'SportField',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    description: {
        type: String,
    },
    status: {
        type: String,
        enum: ['scheduled', 'in_progress', 'completed'],
        default: 'scheduled'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Maintenance", maintenanceSchema);