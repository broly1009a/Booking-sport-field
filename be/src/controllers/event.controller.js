const EventService = require('../services/event.service');

class EventController {
    async createEvent(req, res, next) {
        try {
            const event = await EventService.createEvent(req.body);
            res.status(201).json(event);
        } catch (error) {
            next(error);
        }
    }

    async getAllEvents(req, res, next) {
        try {
            const events = await EventService.getAllEvents();
            res.status(200).json(events);
        } catch (error) {
            next(error);
        }
    }

    async getEventById(req, res, next) {
        try {
            const event = await EventService.getEventById(req.params.id);
            if (!event) return res.status(404).json({ message: 'Event not found' });
            res.status(200).json(event);
        } catch (error) {
            next(error);
        }
    }

    async updateEvent(req, res, next) {
        try {
            const event = await EventService.updateEvent(req.params.id, req.body);
            if (!event) return res.status(404).json({ message: 'Event not found' });
            res.status(200).json(event);
        } catch (error) {
            next(error);
        }
    }

    async deleteEvent(req, res, next) {
        try {
            const event = await EventService.deleteEvent(req.params.id);
            if (!event) return res.status(404).json({ message: 'Event not found' });
            res.status(200).json({ message: 'Event deleted' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new EventController();