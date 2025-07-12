const ConsumableService = require('../consumable.service');
const consumableModel = require('../../models/consumable.model');
jest.mock('../../models/consumable.model');

describe('ConsumableService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create consumable', async () => {
        consumableModel.prototype.save = jest.fn().mockResolvedValue({ _id: 'c1' });
        consumableModel.mockImplementation((data) => ({ ...data, save: consumableModel.prototype.save }));
        const result = await ConsumableService.createConsumable({ name: 'c1' });
        expect(result).toHaveProperty('_id', 'c1');
    });

    it('should get consumable by id', async () => {
        consumableModel.findById = jest.fn().mockResolvedValue({ _id: 'c1', name: 'c1' });
        const result = await ConsumableService.getConsumableById('c1');
        expect(consumableModel.findById).toHaveBeenCalledWith('c1');
        expect(result).toHaveProperty('name', 'c1');
    });

    it('should update consumable', async () => {
        consumableModel.findByIdAndUpdate = jest.fn().mockResolvedValue({ _id: 'c1', name: 'updated' });
        const result = await ConsumableService.updateConsumable('c1', { name: 'updated' });
        expect(consumableModel.findByIdAndUpdate).toHaveBeenCalledWith('c1', { name: 'updated' }, { new: true });
        expect(result).toHaveProperty('name', 'updated');
    });

    it('should delete consumable', async () => {
        consumableModel.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: 'c1' });
        const result = await ConsumableService.deleteConsumable('c1');
        expect(consumableModel.findByIdAndDelete).toHaveBeenCalledWith('c1');
        expect(result).toHaveProperty('_id', 'c1');
    });
});