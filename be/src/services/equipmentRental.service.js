const EquipmentRental = require('../models/equipmentRental.model');

class EquipmentRentalService {
    async create(data) {
        if (data.bookingId) {
            const existing = await EquipmentRental.findOne({ bookingId: data.bookingId });
            if (existing) {
                throw new Error('Equipment rental for this booking already exists');

            }
        }
        else if (data.userId && data.equipments && data.equipments.length > 0) {
            const existing = await EquipmentRental.findOne({
                userId: data.userId,
                equipments: { $elemMatch: { equipmentId: { $in: data.equipments.map(e => e.equipmentId) } } }
            });
            if (existing) {
                throw new Error('Equipment rental for this user and equipment already exists');
            }
        }
        return await EquipmentRental.create(data);
    }
    async getAll() {
        return await EquipmentRental.find()
            .populate('userId')
            .populate('equipmentId')
            .populate('bookingId');
    }
    async getById(id) {
        return await EquipmentRental.findById(id)
            .populate('userId')
            .populate('equipmentId')
            .populate('bookingId');
    }
    async update(id, data) {
        return await EquipmentRental.findByIdAndUpdate(id, data, { new: true })
            .populate('userId')
            .populate('equipmentId')
            .populate('bookingId');
    }
    async delete(id) {
        return await EquipmentRental.findByIdAndDelete(id);
    }
}

module.exports = new EquipmentRentalService();