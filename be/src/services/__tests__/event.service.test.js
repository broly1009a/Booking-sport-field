const EventService = require('../event.service');
const Event = require('../../models/event.model');
const Booking = require('../../models/booking.model');
const User = require('../../models/user.model');
const SportField = require('../../models/sportField.model');
const Schedule = require('../../models/schedule.model');

jest.mock('../../models/event.model');
jest.mock('../../models/booking.model');
jest.mock('../../models/user.model');
jest.mock('../../models/sportField.model');
jest.mock('../../models/schedule.model');

describe('EventService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('searchEvent', () => {
        it('should search events with filters', async () => {
            const mockEvents = [{ _id: 'e1' }];
            Event.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        populate: jest.fn().mockReturnValue({
                            sort: jest.fn().mockResolvedValue(mockEvents)
                        })
                    })
                })
            });

            const result = await EventService.searchEvent({ playerLevel: 'beginner' });
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockEvents);
        });
    });

    describe('getAvailableEvent', () => {
        it('should return available events', async () => {
            const mockEvents = [{ _id: 'e1' }];
            Event.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        populate: jest.fn().mockReturnValue({
                            sort: jest.fn().mockResolvedValue(mockEvents)
                        })
                    })
                })
            });

            const result = await EventService.getAvailableEvent();
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockEvents);
        });
    });

    describe('getMyEvent', () => {
        it('should return user events', async () => {
            const mockCreated = [{ _id: 'e1' }];
            const mockParticipated = [{ _id: 'e2' }];
            Event.find.mockResolvedValueOnce(mockCreated)
                .mockResolvedValueOnce(mockParticipated);

            const result = await EventService.getMyEvent('u1');
            expect(result.success).toBe(true);
            expect(result.data.created).toEqual(mockCreated);
            expect(result.data.participated).toEqual(mockParticipated);
        });
    });

    describe('createEvent', () => {
        it('should create event successfully', async () => {
            const mockData = {
                name: 'Test Event',
                fieldId: 'f1',
                startTime: new Date(Date.now() + 3600000),
                endTime: new Date(Date.now() + 7200000),
                minPlayers: 4,
                maxPlayers: 6
            };
            const mockField = { _id: 'f1', pricePerHour: 100 };
            const mockEvent = { _id: 'e1', ...mockData };
            const mockSchedule = {
                timeSlots: [{ startTime: new Date(), endTime: new Date(), status: 'available' }],
                save: jest.fn()
            };

            SportField.findById.mockResolvedValue(mockField);
            Event.findOne.mockResolvedValue(null);
            Event.prototype.save = jest.fn().mockResolvedValue(mockEvent);
            Event.prototype.populate = jest.fn().mockResolvedValue(mockEvent);
            Schedule.findOne.mockResolvedValue(mockSchedule);

            const result = await EventService.createEvent(mockData, 'u1');
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockEvent);
        });

        it('should throw error for invalid time', async () => {
            const mockData = {
                startTime: new Date(Date.now() - 3600000),
                endTime: new Date(Date.now() + 3600000)
            };

            await expect(EventService.createEvent(mockData, 'u1')).rejects.toMatchObject({
                status: 400,
                message: 'Thời gian bắt đầu phải lớn hơn thời gian hiện tại'
            });
        });

        it('should throw error for overlapping event', async () => {
            const mockData = {
                fieldId: 'f1',
                startTime: new Date(Date.now() + 3600000),
                endTime: new Date(Date.now() + 7200000)
            };
            const mockField = { _id: 'f1', pricePerHour: 100 };

            SportField.findById.mockResolvedValue(mockField);
            Event.findOne.mockResolvedValue({ _id: 'existing' });

            await expect(EventService.createEvent(mockData, 'u1')).rejects.toMatchObject({
                status: 400,
                message: 'Lịch sự kiện trùng với một sự kiện đã tồn tại'
            });
        });
    });

    describe('getEventById', () => {
        it('should return event by id', async () => {
            const mockEvent = { _id: 'e1' };
            Event.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        populate: jest.fn().mockResolvedValue(mockEvent)
                    })
                })
            });

            const result = await EventService.getEventById('e1');
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockEvent);
        });

        it('should throw error if not found', async () => {
            Event.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        populate: jest.fn().mockResolvedValue(null)
                    })
                })
            });

            await expect(EventService.getEventById('e1')).rejects.toMatchObject({
                status: 404,
                message: 'Không tìm thấy event'
            });
        });
    });

    describe('showInterest', () => {
        it('should show interest successfully', async () => {
            const mockEvent = {
                _id: 'e1',
                status: 'open',
                deadline: new Date(Date.now() + 3600000),
                availableSlots: 2,
                interestedPlayers: [],
                startTime: new Date(Date.now() + 7200000),
                endTime: new Date(Date.now() + 10800000),
                save: jest.fn(),
                populate: jest.fn().mockResolvedValue({ _id: 'e1' })
            };

            Event.findById.mockResolvedValue(mockEvent);
            EventService.checkTimeConflict = jest.fn().mockResolvedValue(false);

            const result = await EventService.showInterest('e1', 'u1');
            expect(result.success).toBe(true);
            expect(mockEvent.interestedPlayers).toHaveLength(1);
        });

        it('should throw error if event not found', async () => {
            Event.findById.mockResolvedValue(null);

            await expect(EventService.showInterest('e1', 'u1')).rejects.toMatchObject({
                status: 404,
                message: 'Không tìm thấy event'
            });
        });

        it('should throw error if time conflict', async () => {
            const mockEvent = {
                _id: 'e1',
                status: 'open',
                deadline: new Date(Date.now() + 3600000),
                availableSlots: 2,
                interestedPlayers: [],
                startTime: new Date(Date.now() + 7200000),
                endTime: new Date(Date.now() + 10800000)
            };

            Event.findById.mockResolvedValue(mockEvent);
            EventService.checkTimeConflict = jest.fn().mockResolvedValue(true);

            await expect(EventService.showInterest('e1', 'u1')).rejects.toMatchObject({
                status: 400,
                message: 'Bạn đã có lịch đặt sân hoặc event khác trùng thời gian. Vui lòng kiểm tra lại lịch của bạn!'
            });
        });
    });

    describe('updateEvent', () => {
        it('should update event successfully', async () => {
            const mockEvent = {
                _id: 'e1',
                createdBy: 'u1',
                status: 'open',
                minPlayers: 4,
                maxPlayers: 6,
                interestedPlayers: [],
                save: jest.fn(),
                populate: jest.fn().mockResolvedValue({ _id: 'e1' })
            };

            Event.findById.mockResolvedValue(mockEvent);

            const result = await EventService.updateEvent('e1', { name: 'Updated Event' }, 'u1');
            expect(result.success).toBe(true);
        });

        it('should throw error if not creator', async () => {
            const mockEvent = {
                _id: 'e1',
                createdBy: 'u2',
                status: 'open'
            };

            Event.findById.mockResolvedValue(mockEvent);

            await expect(EventService.updateEvent('e1', {}, 'u1')).rejects.toMatchObject({
                status: 403,
                message: 'Bạn không có quyền cập nhật event này'
            });
        });
    });

    describe('deleteEvent', () => {
        it('should delete event successfully', async () => {
            const mockEvent = {
                _id: 'e1',
                createdBy: 'u1',
                status: 'open',
                save: jest.fn()
            };

            Event.findById.mockResolvedValue(mockEvent);

            const result = await EventService.deleteEvent('e1', 'u1');
            expect(result.success).toBe(true);
            expect(mockEvent.status).toBe('cancelled');
        });
    });

    describe('acceptPlayer', () => {
        it('should accept player successfully', async () => {
            const mockEvent = {
                _id: 'e1',
                createdBy: 'u1',
                status: 'open',
                availableSlots: 2,
                interestedPlayers: [{ userId: 'u2', status: 'pending' }],
                save: jest.fn(),
                populate: jest.fn().mockResolvedValue({ _id: 'e1' })
            };

            Event.findById.mockResolvedValue(mockEvent);

            const result = await EventService.acceptPlayer('e1', 'u2', 'u1');
            expect(result.success).toBe(true);
            expect(mockEvent.availableSlots).toBe(1);
            expect(mockEvent.interestedPlayers[0].status).toBe('accepted');
        });
    });

    describe('rejectPlayer', () => {
        it('should reject player successfully', async () => {
            const mockEvent = {
                _id: 'e1',
                createdBy: 'u1',
                status: 'open',
                availableSlots: 1,
                interestedPlayers: [{ userId: 'u2', status: 'accepted' }],
                save: jest.fn(),
                populate: jest.fn().mockResolvedValue({ _id: 'e1' })
            };

            Event.findById.mockResolvedValue(mockEvent);

            const result = await EventService.rejectPlayer('e1', 'u2', 'u1');
            expect(result.success).toBe(true);
            expect(mockEvent.availableSlots).toBe(2);
            expect(mockEvent.interestedPlayers[0].status).toBe('rejected');
        });
    });

    describe('convertToBooking', () => {
        it('should convert to booking successfully', async () => {
            const mockEvent = {
                _id: 'e1',
                createdBy: { _id: 'u1', fname: 'John', lname: 'Doe', phoneNumber: '123' },
                fieldId: { _id: 'f1', pricePerHour: 100 },
                startTime: new Date(),
                endTime: new Date(Date.now() + 3600000),
                minPlayers: 4,
                maxPlayers: 6,
                discountPercent: 20,
                interestedPlayers: [
                    { userId: { _id: 'u2' }, status: 'accepted' },
                    { userId: { _id: 'u3' }, status: 'accepted' },
                    { userId: { _id: 'u4' }, status: 'accepted' },
                    { userId: { _id: 'u5' }, status: 'accepted' }
                ],
                status: 'open',
                bookingId: null,
                save: jest.fn(),
                populate: jest.fn().mockResolvedValue({ _id: 'e1' })
            };
            const mockBooking = { _id: 'b1', save: jest.fn(), populate: jest.fn().mockResolvedValue({ _id: 'b1' }) };

            Event.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        populate: jest.fn().mockResolvedValue(mockEvent)
                    })
                })
            });
            Booking.prototype.save = jest.fn().mockResolvedValue(mockBooking);
            Booking.prototype.populate = jest.fn().mockResolvedValue(mockBooking);

            const result = await EventService.convertToBooking('e1', 'u1');
            expect(result.success).toBe(true);
            expect(mockEvent.bookingId).toBe('b1');
            expect(mockEvent.status).toBe('confirmed');
        });
    });

    describe('leaveEvent', () => {
        it('should leave event successfully', async () => {
            const mockEvent = {
                _id: 'e1',
                status: 'open',
                deadline: new Date(Date.now() + 3600000),
                availableSlots: 1,
                interestedPlayers: [{ userId: 'u1', status: 'accepted' }],
                save: jest.fn()
            };

            Event.findById.mockResolvedValue(mockEvent);

            const result = await EventService.leaveEvent('e1', 'u1');
            expect(result.success).toBe(true);
            expect(mockEvent.availableSlots).toBe(2);
            expect(mockEvent.interestedPlayers).toHaveLength(0);
        });
    });

    describe('checkTimeConflict', () => {
        it('should return true if booking conflict', async () => {
            Booking.findOne.mockResolvedValue({ _id: 'b1' });

            const result = await EventService.checkTimeConflict('u1', new Date(), new Date(Date.now() + 3600000));
            expect(result).toBe(true);
        });

        it('should return false if no conflict', async () => {
            Booking.findOne.mockResolvedValue(null);
            Event.findOne.mockResolvedValue(null);

            const result = await EventService.checkTimeConflict('u1', new Date(), new Date(Date.now() + 3600000));
            expect(result).toBe(false);
        });
    });
});