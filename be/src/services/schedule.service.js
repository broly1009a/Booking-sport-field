const Schedule = require('../models/schedule.model');
const SportField = require('../models/sportField.model');
const Booking = require('../models/booking.model');
const Maintenance = require('../models/maintenance.model');
const { generateTimeSlots } = require('../utils/schedule.cron');
class ScheduleService {
    async createSchedule(data) {
        const { fieldId, date, timeSlots } = data;

        // Validate fieldId tồn tại
        const field = await SportField.findById(fieldId);
        if (!field) throw { status: 404, message: 'Sân không tồn tại.' };

        // Validate date và timeSlots
        if (!date || !Array.isArray(timeSlots) || timeSlots.length === 0) {
            throw { status: 400, message: 'Date và timeSlots là bắt buộc.' };
        }
        for (const slot of timeSlots) {
            if (!slot.startTime || !slot.endTime) {
                throw { status: 400, message: 'Mỗi timeSlot cần startTime và endTime.' };
            }
            if (new Date(slot.startTime) >= new Date(slot.endTime)) {
                throw { status: 400, message: 'startTime phải nhỏ hơn endTime.' };
            }
        }

        // Không cho phép trùng lịch cho cùng fieldId và date
        const exists = await Schedule.findOne({ fieldId, date });
        if (exists) throw { status: 409, message: 'Đã có lịch cho sân này vào ngày này.' };

        return await Schedule.create({ fieldId, date, timeSlots });
    }

    async getAllSchedules() {
        return await Schedule.find().populate({ path: 'fieldId', select: '_id name location' });
    }

    async getScheduleById(id) {
        return await Schedule.findById(id).populate({ path: 'fieldId', select: '_id name location' });
    }

    async updateSchedule(id, data) {
        // Có thể validate tương tự create
        return await Schedule.findByIdAndUpdate(id, data, { new: true })
            .populate({ path: 'fieldId', select: '_id name location' });
    }

    async deleteSchedule(id) {
        return await Schedule.findByIdAndDelete(id);
    }

    async updateTimeSlotStatus(scheduleId, slotIndex, status) {
        const schedule = await Schedule.findById(scheduleId);
        if (!schedule) throw { status: 404, message: 'Schedule not found' };
        if (!['available', 'booked', 'maintenance'].includes(status)) {
            throw { status: 400, message: 'Trạng thái không hợp lệ.' };
        }
        if (!schedule.timeSlots[slotIndex]) {
            throw { status: 404, message: 'TimeSlot không tồn tại.' };
        }
        schedule.timeSlots[slotIndex].status = status;
        await schedule.save();
        return schedule;
    }
    async getSchedulesByFieldId(fieldId) {
        return await Schedule.find({ fieldId }).populate({ path: 'fieldId', select: '_id name location' });
    }
    async updateTimeSlotsStatusByBookingAndMaintenance(scheduleId) {
        const schedule = await Schedule.findById(scheduleId);
        if (!schedule) throw { status: 404, message: 'Schedule not found' };

        // Lấy tất cả booking của sân này trong ngày
        const bookings = await Booking.find({
            fieldId: schedule.fieldId,
            startTime: { $lt: new Date(schedule.date.getTime() + 24 * 60 * 60 * 1000) },
            endTime: { $gt: schedule.date }
        });
        console.log('Bookings trong ngày:', bookings);
        // Lấy tất cả maintenance của sân này trong ngày
        const maintenances = await Maintenance.find({
            fieldId: schedule.fieldId,
            startTime: { $lt: new Date(schedule.date.getTime() + 24 * 60 * 60 * 1000) },
            endTime: { $gt: schedule.date }
        });

        // Cập nhật trạng thái từng slot
        schedule.timeSlots.forEach(slot => {
            // Ưu tiên maintenance > booked > available
            let status = 'available';

            // Nếu slot trùng maintenance
            for (const m of maintenances) {
                if (slot.startTime < m.endTime && slot.endTime > m.startTime) {
                    status = 'maintenance';
                    break;
                }
            }

            // Nếu không bị maintenance, check booking
            if (status === 'available') {
                for (const b of bookings) {
                    // console.log('Checking booking:', b);
                    // Kiểm tra xem slot có trùng với booking không
                    if (slot.startTime < b.endTime && slot.endTime > b.startTime) {
                        status = 'booked';
                        break;
                    }
                }
            }

            slot.status = status;
        });

        await schedule.save();
        return schedule;
    }
      async updateAllSchedulesStatusByFieldId(fieldId) {
    // Lấy ngày hôm nay (bỏ giờ phút giây)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Tìm schedule của fieldId cho hôm nay
    let schedule = await Schedule.findOne({ fieldId, date: today });
    if (!schedule) return null;

    // Nếu thiếu slot, cập nhật lại đủ slot
    const fullSlots = generateTimeSlots(today);
    if (schedule.timeSlots.length !== fullSlots.length) {
        schedule.timeSlots = fullSlots;
        await schedule.save();
    }

    await this.updateTimeSlotsStatusByBookingAndMaintenance(schedule._id);
    const updated = await Schedule.findById(schedule._id).populate({ path: 'fieldId', select: '_id name location' });
    return updated;
}
async getSchedulesByType(typeId, date) {
    // Lấy tất cả sân thuộc type
    const fields = await SportField.find({ type: typeId });
    const fieldIds = fields.map(f => f._id);

    // Nếu truyền vào date, lấy đúng ngày đó, không thì lấy hôm nay
     const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const startOfDay = new Date(targetDate);
    const endOfDay = new Date(targetDate);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const schedules = await Schedule.find({
        fieldId: { $in: fieldIds },
        date: { $gte: startOfDay, $lt: endOfDay }
    });

    // Gộp các timeSlots liên tiếp cùng trạng thái
    const scheduleResult = schedules.map(sch => {
    const slots = [];
    let prev = null;
    for (const slot of sch.timeSlots) {
        // Chuyển startTime, endTime sang ISO string không có Z
        const plainSlot = {
            startTime: new Date(slot.startTime).toISOString().replace('Z', ''),
            endTime: new Date(slot.endTime).toISOString().replace('Z', ''),
            status: slot.status
        };
        if (!prev) {
            prev = { ...plainSlot };
        } else if (
            prev.status === plainSlot.status &&
            new Date(prev.endTime).getTime() === new Date(plainSlot.startTime).getTime()
        ) {
            prev.endTime = plainSlot.endTime;
        } else {
            slots.push({ ...prev });
            prev = { ...plainSlot };
        }
    }
    if (prev) {
        slots.push({ ...prev });
    }
    return {
        fieldId: sch.fieldId,
        timeSlots: slots
    };
});

    // Lấy thông tin các sân (giống fakeSportFields)
    const sportFields = fields.map(f => ({
        _id: f._id,
        name: f.name,
        pricePerHour: f.pricePerHour,
        location: f.location,
        capacity: f.capacity,
        amenities: f.amenities,
        status: f.status,
        images: f.images,
        type: f.type
    }));

    // Lấy tất cả timeSlots (giờ) của một schedule bất kỳ
    let timeSlots = [];
    if (schedules.length > 0) {
        timeSlots = schedules[0].timeSlots.map(slot => {
            const date = new Date(slot.startTime);
            // Format HH:mm
            return date.toISOString().substr(11, 5);
        });
    }

    return {
        sportFields,
        timeSlots,
        schedules: scheduleResult
    };
}
}

module.exports = new ScheduleService();