const TypeService = require('../type.service');
const Type = require('../../models/type.model');
jest.mock('../../models/type.model');

describe('TypeService', () => {
    let originalSave;

    beforeEach(() => {
        jest.clearAllMocks();
        originalSave = Type.prototype.save;
    });

    afterEach(() => {
        Type.prototype.save = originalSave;
    });

    it('should create type', async () => {
        Type.prototype.save = jest.fn().mockResolvedValue({ _id: 't1' });
        Type.mockImplementation((data) => ({ ...data, save: Type.prototype.save }));
        const result = await TypeService.createType({ name: 'type1' });
        expect(result).toHaveProperty('_id', 't1');
    });

    it('should get type by id', async () => {
        Type.findById = jest.fn().mockResolvedValue({ _id: 't1', name: 'type1' });
        const result = await TypeService.getTypeById('t1');
        expect(Type.findById).toHaveBeenCalledWith('t1');
        expect(result).toHaveProperty('name', 'type1');
    });

    it('should get all types', async () => {
        Type.find = jest.fn().mockResolvedValue([{ _id: 't1', name: 'type1' }]);
        const result = await TypeService.getAllTypes();
        expect(Type.find).toHaveBeenCalledWith({});
        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('name', 'type1');
    });

    it('should update type', async () => {
        Type.findByIdAndUpdate = jest.fn().mockResolvedValue({ _id: 't1', name: 'type1-updated' });
        const result = await TypeService.updateType('t1', { name: 'type1-updated' });
        expect(Type.findByIdAndUpdate).toHaveBeenCalledWith('t1', { name: 'type1-updated' }, { new: true });
        expect(result).toHaveProperty('name', 'type1-updated');
    });

    it('should delete type', async () => {
        Type.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: 't1' });
        const result = await TypeService.deleteType('t1');
        expect(Type.findByIdAndDelete).toHaveBeenCalledWith('t1');
        expect(result).toHaveProperty('_id', 't1');
    });
});