
const mongoose = require('mongoose');
const { Schema } = mongoose;

const eventSchema = new Schema({
    // Thông tin cơ bản
    name: {
        type: String,
        required: [true, "Event name is required!"],
        minLength: 1,
        maxLength: 100
    },
    description: {
        type: String,
        required: [true, "Event description is required!"],
        minLength: 1,
        maxLength: 500
    },
    image: {
        type: String,
        minLength: 1,
        maxLength: 500
    },
    
    // Sân và người tạo
    fieldId: {
        type: Schema.Types.ObjectId,
        ref: 'SportField',
        required: [true, "Sport field is required!"]
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Creator is required!"]
    },
    
    // Thời gian
    startTime: {
        type: Date,
        required: [true, "Event start time is required!"]
    },
    endTime: {
        type: Date,
        required: [true, "Event end time is required!"]
    },
    deadline: {
        type: Date,
        required: [true, "Registration deadline is required!"]
    },
    
    // Cấu hình matching
    minPlayers: {
        type: Number,
        required: true,
        min: 4,
        max: 8,
        default: 4
    },
    maxPlayers: {
        type: Number,
        required: true,
        min: 4,
        max: 8,
        default: 8
    },
    availableSlots: {
        type: Number,
        required: true,
        min: 0,
        max: 8,
        default: 8
    },
    
    // Thông tin người chơi
    playerLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'any'],
        default: 'any'
    },
    playStyle: {
        type: String,
        enum: ['competitive', 'casual', 'training', 'any'],
        default: 'casual'
    },
    teamPreference: {
        type: String,
        enum: ['fixed', 'random', 'balanced'],
        default: 'random'
    },
    
    // Danh sách người quan tâm
    interestedPlayers: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        requestedAt: {
            type: Date,
            default: Date.now
        },
        note: String
    }],
    
    // Trạng thái và giá
    status: {
        type: String,
        enum: ['open', 'full', 'confirmed', 'cancelled', 'completed'],
        default: 'open'
    },
    discountPercent: {
        type: Number,
        min: 0,
        max: 50,
        default: 20,
        required: true
    },
    estimatedPrice: {
        type: Number,
        min: 0,
        default: 0
    },
    
    // Booking liên kết (sau khi convert)
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: 'Booking'
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field: số người đã được chấp nhận
eventSchema.virtual('acceptedCount').get(function() {
    return this.interestedPlayers.filter(p => p.status === 'accepted').length + 1; // +1 cho creator
});

// Virtual field: có đủ người chưa
eventSchema.virtual('isReady').get(function() {
    const total = this.interestedPlayers.filter(p => p.status === 'accepted').length + 1;
    return total >= this.minPlayers;
});

// Index để tìm kiếm nhanh
eventSchema.index({ status: 1, startTime: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ 'interestedPlayers.userId': 1 });

module.exports = mongoose.model("Event", eventSchema);

