const mongoose = require('mongoose');
const { Schema } = mongoose;

const favoriteSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fieldId: {
    type: Schema.Types.ObjectId,
    ref: 'SportField',
    required: true
  }
}, { timestamps: true });

favoriteSchema.index({ userId: 1, fieldId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
