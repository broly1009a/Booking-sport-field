const express = require('express');
const router = express.Router();
const ScheduleController = require('../../../controllers/schedule.controller');

router.get('/', ScheduleController.getAllSchedules);
router.get('/complex/:complexId/schedules', ScheduleController.getSchedulesByComplexId);
router.get('/field/:fieldId', ScheduleController.getSchedulesByFieldId);
router.patch('/field/:fieldId/update-all-time-slots', ScheduleController.updateAllSchedulesStatusByFieldId);
router.patch('/:id/update-time-slots', ScheduleController.updateTimeSlotsStatusByBookingAndMaintenance);

router.get('/:id', ScheduleController.getScheduleById);
router.post('/', ScheduleController.createSchedule);
router.put('/:id', ScheduleController.updateSchedule);
router.delete('/:id', ScheduleController.deleteSchedule);
// Cập nhật trạng thái 1 timeSlot cụ thể
router.patch('/:id/time-slot/:slotIndex', ScheduleController.updateTimeSlotStatus);

module.exports = router;