const Maintenance = require('../models/maintenance.model');
const SportField = require('../models/sportField.model');
const Schedule = require('../models/schedule.model');
class MaintenanceService {
    async createMaintenance(data) {
    const { fieldId, startTime, endTime, description, status } = data;

    // Validate fieldId tồn tại
    const field = await SportField.findById(fieldId);
    if (!field) {
        throw { status: 404, message: 'Sân không tồn tại.' };
    }

    // Validate thời gian
    if (!startTime || !endTime) {
        throw { status: 400, message: 'Start time và end time là bắt buộc.' };
    }
    if (new Date(startTime) >= new Date(endTime)) {
        throw { status: 400, message: 'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.' };
    }

    // Không cho phép trùng lịch bảo trì cùng sân
    const overlap = await Maintenance.findOne({
        fieldId,
        $or: [
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
        ],
        status: { $in: ['scheduled', 'in_progress'] }
    });
    if (overlap) {
        throw { status: 409, message: 'Sân đã có lịch bảo trì trong khoảng thời gian này.' };
    }

    // Tạo maintenance
    const maintenance = await Maintenance.create({ fieldId, startTime, endTime, description, status });

    // Cập nhật trạng thái các timeSlot trong Schedule thành 'maintenance'
    // Tìm schedule đúng ngày của startTime (UTC 00:00)
    const maintenanceDate = new Date(startTime);
    const scheduleDate = new Date(Date.UTC(
        maintenanceDate.getUTCFullYear(),
        maintenanceDate.getUTCMonth(),
        maintenanceDate.getUTCDate(),
        0, 0, 0, 0
    ));
    const schedule = await Schedule.findOne({ fieldId, date: scheduleDate });
    if (schedule) {
        let updated = false;
        for (const slot of schedule.timeSlots) {
            if (
                slot.startTime < new Date(endTime) &&
                slot.endTime > new Date(startTime)
            ) {
                slot.status = 'maintenance';
                updated = true;
            }
        }
        if (updated) await schedule.save();
    }

    return maintenance;
}

    async getAllMaintenances() {
        return await Maintenance.find()
            .populate({ path: 'fieldId', select: '_id name location' });
    }

    async getMaintenanceById(id) {
        return await Maintenance.findById(id)
            .populate({ path: 'fieldId', select: '_id name location' });
    }

    async updateMaintenance(id, data) {
    const { fieldId, startTime, endTime } = data;

    // Validate fieldId tồn tại nếu có cập nhật
    if (fieldId) {
        const field = await SportField.findById(fieldId);
        if (!field) {
            throw { status: 404, message: 'Sân không tồn tại.' };
        }
    }

    // Validate thời gian nếu có cập nhật
    if (startTime && endTime) {
        if (new Date(startTime) >= new Date(endTime)) {
            throw { status: 400, message: 'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.' };
        }

        // Không cho phép trùng lịch bảo trì khác
        const overlap = await Maintenance.findOne({
            _id: { $ne: id },
            fieldId: fieldId,
            $or: [
                { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
            ],
            status: { $in: ['scheduled', 'in_progress'] }
        });
        if (overlap) {
            throw { status: 409, message: 'Sân đã có lịch bảo trì trong khoảng thời gian này.' };
        }
    }

    return await Maintenance.findByIdAndUpdate(id, data, { new: true })
        .populate({ path: 'fieldId', select: '_id name location' });
}
    async deleteMaintenance(id) {
        return await Maintenance.findByIdAndDelete(id);
    }
}

module.exports = new MaintenanceService();