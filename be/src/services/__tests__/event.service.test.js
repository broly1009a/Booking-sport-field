const EventService = require('../event.service');
const Event = require('../../models/event.model');

jest.mock('../../models/event.model');

describe('EventService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create event', async () => {
        const data = { name: 'Test Event' };
        Event.create.mockResolvedValue(data);
        const result = await EventService.createEvent(data);
        expect(Event.create).toHaveBeenCalledWith(data);
        expect(result).toEqual(data);
    });

    it('should get all events', async () => {
        const events = [{ name: 'Event 1' }, { name: 'Event 2' }];
        Event.find.mockReturnValue({ populate: jest.fn().mockResolvedValue(events) });
        const result = await EventService.getAllEvents();
        expect(result).toEqual(events);
    });

    it('should get event by id', async () => {
        const event = { name: 'Event 1' };
        Event.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(event) });
        const result = await EventService.getEventById('id1');
        expect(result).toEqual(event);
    });

    it('should update event', async () => {
        const updated = { name: 'Updated Event' };
        Event.findByIdAndUpdate.mockResolvedValue(updated);
        const result = await EventService.updateEvent('id1', { name: 'Updated Event' });
        expect(Event.findByIdAndUpdate).toHaveBeenCalledWith('id1', { name: 'Updated Event' }, { new: true });
        expect(result).toEqual(updated);
    });

    it('should delete event', async () => {
        const deleted = { name: 'Deleted Event' };
        Event.findByIdAndDelete.mockResolvedValue(deleted);
        const result = await EventService.deleteEvent('id1');
        expect(Event.findByIdAndDelete).toHaveBeenCalledWith('id1');
        expect(result).toEqual(deleted);
    });
});