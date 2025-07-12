const EquipmentRentalService = require('../equipmentRental.service');
const EquipmentRental = require('../../models/equipmentRental.model');
jest.mock('../../models/equipmentRental.model');

describe('EquipmentRentalService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create equipment rental', async () => {
        EquipmentRental.create.mockResolvedValue({ _id: 'er1' });
        const result = await EquipmentRentalService.create({ userId: 'u1', equipmentId: 'e1' });
        expect(result).toHaveProperty('_id', 'er1');
    });

    it('should get all equipment rentals', async () => {
        EquipmentRental.find.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockResolvedValue([{ _id: 'er1' }])
        });
        const result = await EquipmentRentalService.getAll();
        expect(Array.isArray(result)).toBe(true);
    });

    it('should get equipment rental by id', async () => {
        EquipmentRental.findById.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockResolvedValue({ _id: 'er1', userId: 'u1', equipmentId: 'e1' })
        });
        const result = await EquipmentRentalService.getById('er1');
        expect(result).toHaveProperty('_id', 'er1');
        expect(result).toHaveProperty('userId', 'u1');
    });

    it('should update equipment rental', async () => {
        EquipmentRental.findByIdAndUpdate.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockResolvedValue({ _id: 'er1', userId: 'u2', equipmentId: 'e1' })
        });
        const result = await EquipmentRentalService.update('er1', { userId: 'u2' });
        expect(result).toHaveProperty('userId', 'u2');
    });

    it('should delete equipment rental', async () => {
        EquipmentRental.findByIdAndDelete.mockResolvedValue({ _id: 'er1' });
        const result = await EquipmentRentalService.delete('er1');
        expect(result).toHaveProperty('_id', 'er1');
    });

    it('should get equipment rental by bookingId', async () => {
        EquipmentRental.findOne.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            populate: jest.fn().mockResolvedValue({ _id: 'er2', bookingId: 'b1' })
        });
        const result = await EquipmentRentalService.getByBookingId('b1');
        expect(result).toHaveProperty('bookingId', 'b1');
    });
});