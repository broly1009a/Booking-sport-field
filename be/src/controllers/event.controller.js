const EventService = require('../services/event.service');

class EventController {
    // Tìm kiếm event với bộ lọc
    async searchEvent(req, res, next) {
        try {
            const filters = req.query;
            const events = await EventService.searchEvent(filters);
            res.status(200).json({ 
                success: true, 
                data: events,
                count: events.length 
            });
        } catch (error) {
            next(error);
        }
    }

    // Lấy các event còn slot
    async getAvailableEvent(req, res, next) {
        try {
            const events = await EventService.getAvailableEvent();
            res.status(200).json({ 
                success: true, 
                data: events,
                count: events.length 
            });
        } catch (error) {
            next(error);
        }
    }

    // Lấy event của user (đã tạo và tham gia)
    async getMyEvent(req, res, next) {
        try {
            const userId = req.user._id; // Từ auth middleware
            const result = await EventService.getMyEvent(userId);
            res.status(200).json({ 
                success: true, 
                data: result 
            });
        } catch (error) {
            next(error);
        }
    }

    // Tạo event matching mới
    async createEvent(req, res, next) {
        try {
            const data = req.body;
            const userId = req.user._id; // Từ auth middleware
            const event = await EventService.createEvent(data, userId);
            res.status(201).json({ 
                success: true, 
                message: 'Tạo event thành công',
                data: event 
            });
        } catch (error) {
            next(error);
        }
    }

    // Lấy chi tiết event
    async getEventById(req, res, next) {
        try {
            const { id } = req.params;
            const event = await EventService.getEventById(id);
            res.status(200).json({ success: true, data: event });
        } catch (error) {
            next(error);
        }
    }

    // Cập nhật event
    async updateEvent(req, res, next) {
        try {
            const { id } = req.params;
            const data = req.body;
            const userId = req.user._id;
            const updated = await EventService.updateEvent(id, data, userId);
            res.status(200).json({ 
                success: true, 
                message: 'Cập nhật event thành công',
                data: updated 
            });
        } catch (error) {
            next(error);
        }
    }

    // Xóa/Hủy event
    async deleteEvent(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user._id;
            const result = await EventService.deleteEvent(id, userId);
            res.status(200).json({ 
                success: true, 
                message: result.message 
            });
        } catch (error) {
            next(error);
        }
    }

    // Bày tỏ quan tâm tham gia event
    async showInterest(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user._id;
            const { note } = req.body;
            const event = await EventService.showInterest(id, userId, note);
            res.status(200).json({ 
                success: true, 
                message: 'Đã gửi yêu cầu tham gia',
                data: event 
            });
        } catch (error) {
            next(error);
        }
    }

    // Chấp nhận người chơi
    async acceptPlayer(req, res, next) {
        try {
            const { id, playerId } = req.params;
            const userId = req.user._id;
            const event = await EventService.acceptPlayer(id, playerId, userId);
            res.status(200).json({ 
                success: true, 
                message: 'Đã chấp nhận người chơi',
                data: event 
            });
        } catch (error) {
            next(error);
        }
    }

    // Từ chối người chơi
    async rejectPlayer(req, res, next) {
        try {
            const { id, playerId } = req.params;
            const userId = req.user._id;
            const event = await EventService.rejectPlayer(id, playerId, userId);
            res.status(200).json({ 
                success: true, 
                message: 'Đã từ chối người chơi',
                data: event 
            });
        } catch (error) {
            next(error);
        }
    }

    // Xóa người chơi
    async removePlayer(req, res, next) {
        try {
            const { id, playerId } = req.params;
            const userId = req.user._id;
            const event = await EventService.removePlayer(id, playerId, userId);
            res.status(200).json({ 
                success: true, 
                message: 'Đã xóa người chơi',
                data: event 
            });
        } catch (error) {
            next(error);
        }
    }

    // Chuyển đổi event thành booking
    async convertToBooking(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user._id;
            const result = await EventService.convertToBooking(id, userId);
            res.status(200).json({ 
                success: true, 
                message: 'Đã chuyển đổi event thành booking thành công',
                data: result 
            });
        } catch (error) {
            next(error);
        }
    }

    // Rời khỏi event
    async leaveEvent(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user._id;
            const result = await EventService.leaveEvent(id, userId);
            res.status(200).json({ 
                success: true, 
                message: result.message 
            });
        } catch (error) {
            next(error);
        }
    }

    // Cập nhật tự động status event
    async checkEventStatus(req, res, next) {
        try {
            const { id } = req.params;
            const event = await EventService.autoUpdateEventStatus(id);
            res.status(200).json({ 
                success: true, 
                data: event 
            });
        } catch (error) {
            next(error);
        }
    }

    // Lấy lịch trình của user (bookings + events)
    async getUserSchedule(req, res, next) {
        try {
            const userId = req.user._id;
            const schedule = await EventService.getUserSchedule(userId);
            res.status(200).json({ 
                success: true, 
                message: 'Lấy lịch trình thành công',
                data: schedule 
            });
        } catch (error) {
            next(error);
        }
    }

    // Kiểm tra xung đột thời gian
    async checkTimeConflict(req, res, next) {
        try {
            const userId = req.user._id;
            const { startTime, endTime } = req.body;
            const hasConflict = await EventService.checkTimeConflict(userId, startTime, endTime);
            res.status(200).json({ 
                success: true, 
                hasConflict,
                message: hasConflict ? 'Có xung đột thời gian' : 'Không có xung đột'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new EventController();