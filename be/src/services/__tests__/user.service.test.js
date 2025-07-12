const UserService = require('../user.service');
const User = require('../../models/user.model');
jest.mock('../../models/user.model');

describe('UserService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should get all users', async () => {
        User.find.mockResolvedValue([{ _id: 'u1' }]);
        const result = await UserService.getAllUsers();
        expect(Array.isArray(result)).toBe(true);
        expect(result).toEqual([{ _id: 'u1' }]);
    });

    it('should update account info', async () => {
        const save = jest.fn().mockResolvedValue({ _id: 'u1', fname: 'A' });
        User.findById.mockResolvedValue({ _id: 'u1', save });
        const result = await UserService.updateAccountInfo('u1', 'A', 'B', new Date(), '123', 'MALE', 'CUSTOMER');
        expect(result).toHaveProperty('_id', 'u1');
        expect(save).toHaveBeenCalled();
    });

    it('should throw if user not found when updateAccountInfo', async () => {
        User.findById.mockResolvedValue(null);
        await expect(UserService.updateAccountInfo('u1', 'A', 'B', new Date(), '123', 'MALE', 'CUSTOMER'))
            .rejects.toMatchObject({ status: 404 });
    });

    it('should update customer info', async () => {
        const save = jest.fn().mockResolvedValue({ _id: 'u2', fname: 'B' });
        User.findOne.mockResolvedValue({ _id: 'u2', save });
        const result = await UserService.updateCustomerInfo('B', 'C', new Date(), '123', 'MALE', 'firebaseUID');
        expect(result).toHaveProperty('_id', 'u2');
        expect(save).toHaveBeenCalled();
    });

    it('should throw if user not found when updateCustomerInfo', async () => {
        User.findOne.mockResolvedValue(null);
        await expect(UserService.updateCustomerInfo('B', 'C', new Date(), '123', 'MALE', 'firebaseUID'))
            .rejects.toMatchObject({ status: 404 });
    });

    it('should get paginated users', async () => {
        User.find.mockReturnValue({
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue([{ _id: 'u3' }])
        });
        const result = await UserService.getPaginatedUsers(1, 10, '', '');
        expect(Array.isArray(result)).toBe(true);
    });
});