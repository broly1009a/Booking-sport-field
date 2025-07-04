const BookingService = require('../booking.service');
const bookingModel = require('../../models/booking.model');
const SportField = require('../../models/sportField.model');
const Schedule = require('../../models/schedule.model');
const { User } = require('../../models');
const mongoose = require('mongoose');

// Chỉ mock ObjectId nếu cần
jest.spyOn(mongoose.Types, 'ObjectId').mockImplementation(id => id);

jest.mock('../../models/booking.model');
jest.mock('../../models/sportField.model');
jest.mock('../../models/schedule.model');
jest.mock('../../models');

describe('BookingService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createBooking', () => {
        it('should throw if missing startTime or endTime', async () => {
            await expect(BookingService.createBooking({})).rejects.toMatchObject({ status: 400 });
        });

        it('should throw if user not found', async () => {
            User.findById.mockResolvedValue(null);
            await expect(BookingService.createBooking({
                startTime: new Date(),
                endTime: new Date(Date.now() + 3600000),
                userId: 'u1',
                fieldId: 'f1'
            })).rejects.toMatchObject({ status: 404 });
        });

        it('should throw if field not found', async () => {
            User.findById.mockResolvedValue({ _id: 'u1' });
            SportField.findById.mockResolvedValue(null);
            await expect(BookingService.createBooking({
                startTime: new Date(),
                endTime: new Date(Date.now() + 3600000),
                userId: 'u1',
                fieldId: 'f1'
            })).rejects.toMatchObject({ status: 404 });
        });

        it('should throw if participants exceed capacity', async () => {
            User.findById.mockResolvedValue({ _id: 'u1' });
            SportField.findById.mockResolvedValue({ _id: 'f1', capacity: 2 });
            await expect(BookingService.createBooking({
                startTime: new Date(),
                endTime: new Date(Date.now() + 3600000),
                userId: 'u1',
                fieldId: 'f1',
                participants: ['a', 'b']
            })).rejects.toMatchObject({ status: 400 });
        });

        it('should throw if booking time overlaps', async () => {
            User.findById.mockResolvedValue({ _id: 'u1' });
            SportField.findById.mockResolvedValue({ _id: 'f1', capacity: 10 });
            bookingModel.findOne.mockResolvedValue({ _id: 'b2' });
            await expect(BookingService.createBooking({
                startTime: new Date(),
                endTime: new Date(Date.now() + 3600000),
                userId: 'u1',
                fieldId: 'f1',
                participants: []
            })).rejects.toMatchObject({ status: 409 });
        });

        it('should create booking if valid', async () => {
            const now = new Date(Date.now() + 3600000);
            User.findById.mockResolvedValue({ _id: 'u1' });
            SportField.findById.mockResolvedValue({ _id: 'f1', capacity: 10 });
            bookingModel.findOne.mockResolvedValue(null);
            bookingModel.prototype.save = jest.fn().mockResolvedValue({ _id: 'b1' });
            Schedule.findOne.mockResolvedValue(null);

            const booking = await BookingService.createBooking({
                startTime: now,
                endTime: new Date(now.getTime() + 3600000),
                userId: 'u1',
                fieldId: 'f1',
                participants: []
            });
            expect(booking).toHaveProperty('_id', 'b1');
        });
    });

    describe('getAllBookings', () => {
        it('should return all bookings', async () => {
            bookingModel.find.mockResolvedValue([{}]);
            const result = await BookingService.getAllBookings();
            expect(result).toEqual([{}]);
        });
    });

   describe('getBookingById', () => {
    it('should return booking by id', async () => {
     
        const mockPopulate = jest.fn().mockReturnThis();
        const mockResult = Promise.resolve({ _id: 'b1' });
   
        bookingModel.findById.mockReturnValue({
            populate: mockPopulate,
         
            then: mockResult.then.bind(mockResult),
            catch: mockResult.catch.bind(mockResult)
        });
     
        mockPopulate.mockReturnValueOnce({
            populate: mockPopulate,
            then: mockResult.then.bind(mockResult),
            catch: mockResult.catch.bind(mockResult)
        }).mockReturnValueOnce({
            populate: mockPopulate,
            then: mockResult.then.bind(mockResult),
            catch: mockResult.catch.bind(mockResult)
        }).mockReturnValueOnce(mockResult);

        const result = await BookingService.getBookingById('b1');
        expect(result).toHaveProperty('_id', 'b1');
    });
});

describe('updateBooking', () => {
    it('should update and return booking', async () => {
        const mockPopulate = jest.fn().mockReturnThis();
        const mockResult = Promise.resolve({ _id: 'b1', updated: true });
        bookingModel.findByIdAndUpdate.mockReturnValue({
            populate: mockPopulate,
            then: mockResult.then.bind(mockResult),
            catch: mockResult.catch.bind(mockResult)
        });
        mockPopulate.mockReturnValueOnce({
            populate: mockPopulate,
            then: mockResult.then.bind(mockResult),
            catch: mockResult.catch.bind(mockResult)
        }).mockReturnValueOnce({
            populate: mockPopulate,
            then: mockResult.then.bind(mockResult),
            catch: mockResult.catch.bind(mockResult)
        }).mockReturnValueOnce(mockResult);

        const result = await BookingService.updateBooking('b1', {});
        expect(result).toHaveProperty('updated', true);
    });
});

    describe('deleteBooking', () => {
        it('should delete and return booking', async () => {
            bookingModel.findByIdAndDelete.mockResolvedValue({ _id: 'b1' });
            const result = await BookingService.deleteBooking('b1');
            expect(result).toHaveProperty('_id', 'b1');
        });
    });

    describe('getPaginatedBookings', () => {
        it('should return paginated bookings', async () => {
            const populateMock = jest.fn().mockReturnThis();
            bookingModel.find.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                populate: populateMock,
                populate: populateMock,
                populate: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue([{}])
            });
            bookingModel.countDocuments.mockResolvedValue(1);
            SportField.find.mockResolvedValue([{ _id: 'f1' }]);
            const result = await BookingService.getPaginatedBookings({ page: 1, limit: 1 });
            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('meta');
        });
    });

    describe('roundAllBookingTimesToHour', () => {
        it('should round all booking times', async () => {
            const save = jest.fn();
            bookingModel.find.mockResolvedValue([
                { startTime: new Date(), endTime: new Date(), save }
            ]);
            const result = await BookingService.roundAllBookingTimesToHour();
            expect(result).toHaveProperty('success', true);
            expect(save).toHaveBeenCalled();
        });
    });

    describe('getBookingsByUser', () => {
        it('should aggregate bookings by user', async () => {
            bookingModel.aggregate.mockResolvedValue([{ _id: 'b1' }]);
            const result = await BookingService.getBookingsByUser('u1');
            expect(result).toEqual([{ _id: 'b1' }]);
        });
    });
});