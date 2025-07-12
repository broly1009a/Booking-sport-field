const EquipmentService = require('../equipment.service');
const equipmentModel = require('../../models/equipment.model');
jest.mock('../../models/equipment.model');

describe('EquipmentService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create equipment', async () => {
        equipmentModel.prototype.save = jest.fn().mockResolvedValue({ _id: 'e1', name: 'eq1' });
        equipmentModel.mockImplementation((data) => ({ ...data, save: equipmentModel.prototype.save }));
        const result = await EquipmentService.createEquipment({ name: 'eq1' });
        expect(result).toHaveProperty('_id', 'e1');
        expect(result).toHaveProperty('name', 'eq1');
    });

    it('should get equipment by id', async () => {
        equipmentModel.findById = jest.fn().mockResolvedValue({ _id: 'e1', name: 'eq1' });
        const result = await EquipmentService.getEquipmentById('e1');
        expect(equipmentModel.findById).toHaveBeenCalledWith('e1');
        expect(result).toHaveProperty('_id', 'e1');
    });

    it('should update equipment', async () => {
        equipmentModel.findByIdAndUpdate = jest.fn().mockResolvedValue({ _id: 'e1', name: 'eq2' });
        const result = await EquipmentService.updateEquipment('e1', { name: 'eq2' });
        expect(equipmentModel.findByIdAndUpdate).toHaveBeenCalledWith('e1', { name: 'eq2' }, { new: true });
        expect(result).toHaveProperty('name', 'eq2');
    });

    it('should delete equipment', async () => {
        equipmentModel.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: 'e1' });
        const result = await EquipmentService.deleteEquipment('e1');
        expect(equipmentModel.findByIdAndDelete).toHaveBeenCalledWith('e1');
        expect(result).toHaveProperty('_id', 'e1');
    });
});