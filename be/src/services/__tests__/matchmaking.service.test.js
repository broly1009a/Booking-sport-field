const MatchmakingService = require('../matchmaking.service');
const matchmakingModel = require('../../models/matchmaking.model');
const bookingModel = require('../../models/booking.model');
const { User } = require('../../models');

jest.mock('../../models/matchmaking.model');
jest.mock('../../models/booking.model');
jest.mock('../../models');

describe('MatchmakingService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createMatchmaking', () => {
        it('should throw if booking not found', async () => {
            bookingModel.findById.mockResolvedValue(null);
            await expect(MatchmakingService.createMatchmaking({
                bookingId: 'b1', userId: 'u1', requiredPlayers: 2
            })).rejects.toMatchObject({ status: 404 });
        });

        it('should throw if user not found', async () => {
            bookingModel.findById.mockResolvedValue({ _id: 'b1' });
            User.findById.mockResolvedValue(null);
            await expect(MatchmakingService.createMatchmaking({
                bookingId: 'b1', userId: 'u1', requiredPlayers: 2
            })).rejects.toMatchObject({ status: 404 });
        });

        it('should throw if existing open/full matchmaking', async () => {
            bookingModel.findById.mockResolvedValue({ _id: 'b1' });
            User.findById.mockResolvedValue({ _id: 'u1' });
            matchmakingModel.findOne.mockResolvedValue({ _id: 'm1' });
            await expect(MatchmakingService.createMatchmaking({
                bookingId: 'b1', userId: 'u1', requiredPlayers: 2
            })).rejects.toMatchObject({ status: 409 });
        });

        it('should throw if requiredPlayers < 1', async () => {
            bookingModel.findById.mockResolvedValue({ _id: 'b1' });
            User.findById.mockResolvedValue({ _id: 'u1' });
            matchmakingModel.findOne.mockResolvedValue(null);
            await expect(MatchmakingService.createMatchmaking({
                bookingId: 'b1', userId: 'u1', requiredPlayers: 0
            })).rejects.toMatchObject({ status: 400 });
        });

        it('should throw if joinedPlayers > requiredPlayers', async () => {
            bookingModel.findById.mockResolvedValue({ _id: 'b1' });
            User.findById.mockResolvedValue({ _id: 'u1' });
            matchmakingModel.findOne.mockResolvedValue(null);
            await expect(MatchmakingService.createMatchmaking({
                bookingId: 'b1', userId: 'u1', requiredPlayers: 2, joinedPlayers: ['a', 'b', 'c']
            })).rejects.toMatchObject({ status: 400 });
        });

        it('should throw if userId in joinedPlayers', async () => {
            bookingModel.findById.mockResolvedValue({ _id: 'b1' });
            User.findById.mockResolvedValue({ _id: 'u1' });
            matchmakingModel.findOne.mockResolvedValue(null);
            await expect(MatchmakingService.createMatchmaking({
                bookingId: 'b1', userId: 'u1', requiredPlayers: 2, joinedPlayers: ['u1']
            })).rejects.toMatchObject({ status: 400 });
        });

        it('should create matchmaking if valid', async () => {
            bookingModel.findById.mockResolvedValue({ _id: 'b1' });
            User.findById.mockResolvedValue({ _id: 'u1' });
            matchmakingModel.findOne.mockResolvedValue(null);
            const save = jest.fn().mockResolvedValue({ _id: 'm2' });
            matchmakingModel.mockImplementation(() => ({ save }));
            const result = await MatchmakingService.createMatchmaking({
                bookingId: 'b1', userId: 'u1', requiredPlayers: 2, joinedPlayers: []
            });
            expect(result).toHaveProperty('_id', 'm2');
        });
    });
describe('getAllMatchmakings', () => {
    it('should return all matchmakings', async () => {
        // Mock chuỗi .populate().populate().populate() trả về Promise
        const mockPopulate = jest.fn().mockReturnThis();
        const mockResult = Promise.resolve([{ _id: 'm1' }]);
        matchmakingModel.find.mockReturnValue({
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

        const result = await MatchmakingService.getAllMatchmakings();
        expect(Array.isArray(result)).toBe(true);
    });
});

  describe('getMatchmakingById', () => {
    it('should return matchmaking by id', async () => {
        const mockPopulate = jest.fn().mockReturnThis();
        const mockResult = Promise.resolve({ _id: 'm1' });
        matchmakingModel.findById.mockReturnValue({
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

        const result = await MatchmakingService.getMatchmakingById('m1');
        expect(result).toHaveProperty('_id', 'm1');
    });
});

describe('updateMatchmaking', () => {
    it('should update and return matchmaking', async () => {
        const mockPopulate = jest.fn().mockReturnThis();
        const mockResult = Promise.resolve({ _id: 'm1', updated: true });
        matchmakingModel.findByIdAndUpdate.mockReturnValue({
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

        const result = await MatchmakingService.updateMatchmaking('m1', {});
        expect(result).toHaveProperty('updated', true);
    });
});

describe('getOpenMatchmakings', () => {
    it('should return open matchmakings', async () => {
        const mockPopulate = jest.fn().mockReturnThis();
        const mockResult = Promise.resolve([{ _id: 'm1' }]);
        matchmakingModel.find.mockReturnValue({
            populate: mockPopulate,
            then: mockResult.then.bind(mockResult),
            catch: mockResult.catch.bind(mockResult)
        });
        mockPopulate.mockReturnValueOnce({
            populate: mockPopulate,
            then: mockResult.then.bind(mockResult),
            catch: mockResult.catch.bind(mockResult)
        }).mockReturnValueOnce(mockResult);

        const result = await MatchmakingService.getOpenMatchmakings();
        expect(Array.isArray(result)).toBe(true);
    });
});



    describe('deleteMatchmaking', () => {
        it('should delete and return matchmaking', async () => {
            matchmakingModel.findByIdAndDelete.mockResolvedValue({ _id: 'm1' });
            const result = await MatchmakingService.deleteMatchmaking('m1');
            expect(result).toHaveProperty('_id', 'm1');
        });
    });


   describe('joinMatchmaking', () => {
    it('should join and return populated matchmaking', async () => {
        const save = jest.fn().mockResolvedValue();
        matchmakingModel.findById.mockResolvedValueOnce({ _id: 'm1', status: 'open', save });
        // Lần thứ 2 gọi findById để lấy populated
        const mockPopulate = jest.fn().mockReturnThis();
        const mockResult = Promise.resolve({ _id: 'm1', representativeId: 'u2', status: 'full' });
        matchmakingModel.findById.mockReturnValueOnce({
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
        }).mockReturnValueOnce({
            populate: mockPopulate,
            then: mockResult.then.bind(mockResult),
            catch: mockResult.catch.bind(mockResult)
        }).mockReturnValueOnce(mockResult);

        const result = await MatchmakingService.joinMatchmaking('m1', 'u2');
        expect(result).toHaveProperty('representativeId', 'u2');
        expect(result).toHaveProperty('status', 'full');
    });
});
    describe('getMatchmakingsByUser', () => {
        it('should return matchmakings by user', async () => {
            matchmakingModel.find.mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                populate: jest.fn().mockReturnThis(),
                populate: jest.fn().mockReturnThis(),
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue([{ _id: 'm1' }])
            });
            const result = await MatchmakingService.getMatchmakingsByUser('u1');
            expect(Array.isArray(result)).toBe(true);
        });
    });
});