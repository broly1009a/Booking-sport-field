const equipmentModel = require('../models/equipment.model');

class EquipmentService {
    async createEquipment(equipmentData) {
        const equipment = new equipmentModel(equipmentData);
        return await equipment.save();
    }

    async getAllEquipment() {
        return await equipmentModel.find().populate('sportField');
    }

    async getEquipmentById(equipmentId) {
        return await equipmentModel.findById(equipmentId).populate('sportField');
    }
    async updateEquipment(equipmentId, equipmentData) {
        return await equipmentModel.findByIdAndUpdate(equipmentId, equipmentData, { new: true })
            .populate('sportField');
    }
    async deleteEquipment(equipmentId) {
        return await equipmentModel.findByIdAndDelete(equipmentId);
    }
    async getEquipmentBySportField(sportFieldId) {
        return await equipmentModel.find({ sportField: sportFieldId }).populate('sportField');
    }
    async getAvailableEquipmentBySportField(sportFieldId) {
        return await equipmentModel.find({
            sportField: sportFieldId,
            status: 'available'
        }).populate('sportField');
    }
}
module.exports = new EquipmentService();   