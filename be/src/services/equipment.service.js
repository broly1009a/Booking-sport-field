const equipmentModel = require('../models/equipment.model');
const FieldComplex = require('../models/fieldComplex.model');
const SportField = require('../models/sportField.model');

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
    async getAllEquipmentByStaff(staffId) {
      
        const complex = await FieldComplex.findOne({ staffs: staffId });
        if (!complex) {
            throw { status: 404, message: 'Không tìm thấy cụm sân cho nhân viên này.' };
        }

  
        const sportFields = await SportField.find({ complex: complex._id }).select('_id');

 
        const fieldIds = sportFields.map(f => f._id);
        return await equipmentModel.find({ sportField: { $in: fieldIds } }).populate('sportField');
    }
}
module.exports = new EquipmentService();   