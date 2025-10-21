const mongoose = require('mongoose');
const { Schema } = mongoose;

const fieldComplexSchema = new Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    coordinates: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    description: { type: String, default: "" },
    owner: { type: Schema.Types.ObjectId, ref: 'User' }, 
    images: { type: [String], default: [] },
    isActive: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('FieldComplex', fieldComplexSchema);