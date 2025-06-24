const ConsumablePurchase = require('../models/consumablePurchase.model');

class ConsumablePurchaseService {
    async create(data) {
        if (data.bookingId) {
            const existing = await ConsumablePurchase.findOne({ bookingId: data.bookingId });
            if (existing) {
                throw new Error('Consumable purchase for this booking already exists');
            }
        } else if (data.userId && data.consumableId) {
            const existing = await ConsumablePurchase.findOne({ userId: data.userId, consumableId: data.consumableId });
            if (existing) {
                throw new Error('Consumable purchase for this user and consumable already exists');
            }
        }
        return await ConsumablePurchase.create(data);
    }
    async getAll() {
        return await ConsumablePurchase.find()
            .populate('userId')
            .populate('consumableId')
            .populate('bookingId');
    }
    async getById(id) {
        return await ConsumablePurchase.findById(id)
            .populate('userId')
            .populate('consumableId')
            .populate('bookingId');
    }
    async update(id, data) {
        return await ConsumablePurchase.findByIdAndUpdate(id, data, { new: true })
            .populate('userId')
            .populate('consumableId')
            .populate('bookingId');
    }
    async delete(id) {
        return await ConsumablePurchase.findByIdAndDelete(id);
    }
}

module.exports = new ConsumablePurchaseService();