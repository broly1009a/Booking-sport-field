const SportFieldService = require('../sportField.service');
const sportFieldModel = require('../../models/sportField.model');
const cloudinary = require('../../configs/cloudinary.config');

jest.mock('../../models/sportField.model');
jest.mock('../../configs/cloudinary.config');

describe('SportFieldService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createSportField', () => {
        it('should create sport field without images', async () => {
            sportFieldModel.prototype.save = jest.fn().mockResolvedValue({ _id: 's1' });
            const mockField = { name: 'Field 1', type: 't1' };
            sportFieldModel.mockImplementation(() => ({
                ...mockField,
                save: sportFieldModel.prototype.save
            }));
            const result = await SportFieldService.createSportField(mockField, []);
            expect(result).toHaveProperty('_id', 's1');
        });

        it('should create sport field with images', async () => {
            sportFieldModel.prototype.save = jest.fn().mockResolvedValue({ _id: 's2' });
            const mockField = { name: 'Field 2', type: 't2' };
            sportFieldModel.mockImplementation(() => ({
                ...mockField,
                save: sportFieldModel.prototype.save
            }));
            // Mock cloudinary upload_stream
            const mockUploadStream = jest.fn((options, cb) => ({
                end: (buffer) => cb(null, { secure_url: 'http://img.url/field.jpg' })
            }));
            cloudinary.uploader = { upload_stream: mockUploadStream };
            const file = { buffer: Buffer.from('test') };
            const result = await SportFieldService.createSportField(mockField, [file]);
            expect(result).toHaveProperty('_id', 's2');
        });
    });

    describe('getAllSportFields', () => {
        it('should return all sport fields', async () => {
            sportFieldModel.find.mockReturnValue({
                populate: jest.fn().mockResolvedValue([{ _id: 's1' }])
            });
            const result = await SportFieldService.getAllSportFields();
            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe('getSportFieldById', () => {
        it('should return null if not found', async () => {
            sportFieldModel.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
            const result = await SportFieldService.getSportFieldById('s1');
            expect(result).toBeNull();
        });

        it('should return sport field with similar fields', async () => {
            const mockField = {
                _id: 's1',
                type: { _id: 't1' },
                toObject: () => ({ _id: 's1', type: { _id: 't1' } })
            };
            sportFieldModel.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockField)
            });
            sportFieldModel.find.mockReturnValue({
                limit: jest.fn().mockResolvedValue([{ _id: 's2' }])
            });
            const result = await SportFieldService.getSportFieldById('s1');
            expect(result).toHaveProperty('similarFields');
        });
    });

    describe('updateSportField', () => {
        it('should update sport field without images', async () => {
            sportFieldModel.findByIdAndUpdate.mockResolvedValue({ _id: 's1', updated: true });
            const result = await SportFieldService.updateSportField('s1', { name: 'Field Updated' }, []);
            expect(result).toHaveProperty('updated', true);
        });

        it('should update sport field with images', async () => {
            sportFieldModel.findByIdAndUpdate.mockResolvedValue({ _id: 's2', updated: true });
            // Mock cloudinary upload_stream
            const mockUploadStream = jest.fn((options, cb) => ({
                end: (buffer) => cb(null, { secure_url: 'http://img.url/field2.jpg' })
            }));
            cloudinary.uploader = { upload_stream: mockUploadStream };
            const file = { buffer: Buffer.from('test') };
            const result = await SportFieldService.updateSportField('s2', { name: 'Field Updated 2' }, [file]);
            expect(result).toHaveProperty('updated', true);
        });
    });

    describe('deleteSportField', () => {
        it('should delete and return sport field', async () => {
            sportFieldModel.findByIdAndDelete.mockResolvedValue({ _id: 's1' });
            const result = await SportFieldService.deleteSportField('s1');
            expect(result).toHaveProperty('_id', 's1');
        });
    });
});