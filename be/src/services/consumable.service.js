const consumableModel = require('../models/consumable.model');
const FieldComplex = require('../models/fieldComplex.model');
const SportField = require('../models/sportField.model');

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
    async getAllConsumablesByStaff(staffId) {
        // Tìm complex mà staff thuộc về
        const complex = await FieldComplex.findOne({ staffs: staffId });
        if (!complex) {
            throw { status: 404, message: 'Không tìm thấy cụm sân cho nhân viên này.' };
        }

        // Tìm tất cả sportFields thuộc complex
        const sportFields = await SportField.find({ complex: complex._id }).select('_id');

        // Lấy tất cả consumables thuộc những sportFields đó
        const fieldIds = sportFields.map(f => f._id);
        return await consumableModel.find({ sportField: { $in: fieldIds } }).populate('sportField');
    }
}

module.exports = new ConsumableService();