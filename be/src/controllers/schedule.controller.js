const ScheduleService = require('../services/schedule.service');

class ScheduleController {
    async createSchedule(req, res, next) {
        try {
            const schedule = await ScheduleService.createSchedule(req.body);
            res.status(201).json({ success: true, data: schedule });
        } catch (error) {
            next(error);
        }
    }

    async getAllSchedules(req, res, next) {
        try {
            const schedules = await ScheduleService.getAllSchedules();
            res.status(200).json({ success: true, data: schedules });
        } catch (error) {
            next(error);
        }
    }

    async getScheduleById(req, res, next) {
        try {
            const { id } = req.params;
            const schedule = await ScheduleService.getScheduleById(id);
            if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
            res.status(200).json({ success: true, data: schedule });
        } catch (error) {
            next(error);
        }
    }

    async updateSchedule(req, res, next) {
        try {
            const { id } = req.params;
            const updated = await ScheduleService.updateSchedule(id, req.body);
            if (!updated) return res.status(404).json({ success: false, message: 'Schedule not found' });
            res.status(200).json({ success: true, data: updated });
        } catch (error) {
            next(error);
        }
    }

    async deleteSchedule(req, res, next) {
        try {
            const { id } = req.params;
            const deleted = await ScheduleService.deleteSchedule(id);
            if (!deleted) return res.status(404).json({ success: false, message: 'Schedule not found' });
            res.status(200).json({ success: true, message: 'Schedule deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    async updateTimeSlotStatus(req, res, next) {
        try {
            const { id, slotIndex } = req.params;
            const { status } = req.body;
            const updated = await ScheduleService.updateTimeSlotStatus(id, slotIndex, status);
            res.status(200).json({ success: true, data: updated });
        } catch (error) {
            next(error);
        }
    }
       async getSchedulesByFieldId(req, res, next) {
        try {
            const { fieldId } = req.params;
            const schedules = await ScheduleService.getSchedulesByFieldId(fieldId);
            res.status(200).json({ success: true, data: schedules });
        } catch (error) {
            next(error);
        }
    }
        async updateTimeSlotsStatusByBookingAndMaintenance(req, res, next) {
        try {
            const { id } = req.params;
            const updated = await ScheduleService.updateTimeSlotsStatusByBookingAndMaintenance(id);
            res.status(200).json({ success: true, data: updated });
        } catch (error) {
            next(error);
        }
    }
       async updateAllSchedulesStatusByFieldId(req, res, next) {
        try {
            const { fieldId } = req.params;
            const updated = await ScheduleService.updateAllSchedulesStatusByFieldId(fieldId);
            res.status(200).json({ success: true, data: updated });
        } catch (error) {
            next(error);
        }
    }
    async getSchedulesByComplexId(req, res, next) {
    try {
        const { complexId } = req.params;
        const { date } = req.query;
        const data = await ScheduleService.getSchedulesByComplexId(complexId, date);
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
}
}

module.exports = new ScheduleController();