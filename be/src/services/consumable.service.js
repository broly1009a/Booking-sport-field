const consumableModel = require('../models/consumable.model');

class ConsumableService {
    async createConsumable(consumableData) {
        const consumable = new consumableModel(consumableData);
        return await consumable.save();
    }

    async getAllConsumables() {
        return await consumableModel.find().populate('sportField');
    }

    async getConsumableById(consumableId) {
        return await consumableModel.findById(consumableId).populate('sportField');
    }

    async updateConsumable(consumableId, consumableData) {
        return await consumableModel
            .findByIdAndUpdate(consumableId, consumableData, { new: true })
            .populate('sportField');
    }

    async deleteConsumable(consumableId) {
        return await consumableModel.findByIdAndDelete(consumableId);
    }
     async getAvailableConsumablesBySportField(sportFieldId) {
        return await consumableModel.find({ sportField: sportFieldId, status: 'available' }).populate('sportField');
    }
}

module.exports = new ConsumableService();