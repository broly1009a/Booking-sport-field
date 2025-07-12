const ConsumablePurchaseService = require('../consumablePurchase.service');
const ConsumablePurchase = require('../../models/consumablePurchase.model');
jest.mock('../../models/consumablePurchase.model');

describe('ConsumablePurchaseService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create consumable purchase', async () => {
        ConsumablePurchase.create.mockResolvedValue({ _id: 'cp1' });
        const result = await ConsumablePurchaseService.create({ userId: 'u1', consumableId: 'c1' });
        expect(result).toHaveProperty('_id', 'cp1');
    });

    it('should get all consumable purchases', async () => {
        ConsumablePurchase.find.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockResolvedValue([{ _id: 'cp1' }])
        });
        const result = await ConsumablePurchaseService.getAll();
        expect(Array.isArray(result)).toBe(true);
    });

    it('should get consumable purchase by id', async () => {
        ConsumablePurchase.findById.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockResolvedValue({ _id: 'cp1', userId: 'u1', consumableId: 'c1' })
        });
        const result = await ConsumablePurchaseService.getById('cp1');
        expect(result).toHaveProperty('_id', 'cp1');
        expect(result).toHaveProperty('userId', 'u1');
    });

    it('should update consumable purchase', async () => {
        ConsumablePurchase.findByIdAndUpdate.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockResolvedValue({ _id: 'cp1', userId: 'u2', consumableId: 'c2' })
        });
        const result = await ConsumablePurchaseService.update('cp1', { userId: 'u2', consumableId: 'c2' });
        expect(result).toHaveProperty('userId', 'u2');
        expect(result).toHaveProperty('consumableId', 'c2');
    });

    it('should delete consumable purchase', async () => {
        ConsumablePurchase.findByIdAndDelete.mockResolvedValue({ _id: 'cp1' });
        const result = await ConsumablePurchaseService.delete('cp1');
        expect(result).toHaveProperty('_id', 'cp1');
    });
});