const Event = require('../models/event.model');

class EventService {
    async createEvent(data) {
        return await Event.create(data);
    }

    async getAllEvents() {
        return await Event.find().populate('fieldId organizerId participants');
    }

    async getEventById(id) {
        return await Event.findById(id).populate('fieldId organizerId participants');
    }

    async updateEvent(id, data) {
        return await Event.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteEvent(id) {
        return await Event.findByIdAndDelete(id);
    }
}

module.exports = new EventService();