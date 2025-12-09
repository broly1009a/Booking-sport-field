const FieldComplexService = require('../fieldComplex.service');
const FieldComplex = require('../../models/fieldComplex.model');
const SportField = require('../../models/sportField.model');
const { User } = require('../../models/index');
const admin = require('../../configs/firebaseAdmin');
const cloudinary = require('../../configs/cloudinary.config');
const { v4: uuidv4 } = require('uuid');

jest.mock('../../models/fieldComplex.model');
jest.mock('../../models/sportField.model');
jest.mock('../../models/index');
jest.mock('../../configs/firebaseAdmin');
jest.mock('../../configs/cloudinary.config');
jest.mock('uuid');

describe('FieldComplexService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createFieldComplex', () => {
        it('should create field complex without images', async () => {
            const mockData = { name: 'Complex 1', owner: 'o1' };
            const mockComplex = { ...mockData, _id: 'c1' };
            FieldComplex.prototype.save = jest.fn().mockResolvedValue(mockComplex);
            FieldComplex.mockImplementation(() => ({
                ...mockData,
                save: FieldComplex.prototype.save
            }));

            const result = await FieldComplexService.createFieldComplex(mockData, []);
            expect(result).toEqual(mockComplex);
            expect(FieldComplex).toHaveBeenCalledWith({ ...mockData, images: [] });
        });

        it('should create field complex with images', async () => {
            const mockData = { name: 'Complex 2', owner: 'o2' };
            const mockComplex = { ...mockData, _id: 'c2', images: ['url1'] };
            FieldComplex.prototype.save = jest.fn().mockResolvedValue(mockComplex);
            FieldComplex.mockImplementation(() => ({
                ...mockData,
                images: ['url1'],
                save: FieldComplex.prototype.save
            }));

            uuidv4.mockReturnValue('uuid1');
            const mockUploadStream = jest.fn((options, cb) => ({
                end: (buffer) => cb(null, { secure_url: 'url1' })
            }));
            cloudinary.uploader = { upload_stream: mockUploadStream };

            const file = { buffer: Buffer.from('test') };
            const result = await FieldComplexService.createFieldComplex(mockData, [file]);
            expect(result).toEqual(mockComplex);
            expect(cloudinary.uploader.upload_stream).toHaveBeenCalled();
        });

        it('should handle cloudinary upload error', async () => {
            const mockData = { name: 'Complex 3' };
            uuidv4.mockReturnValue('uuid2');
            const mockUploadStream = jest.fn((options, cb) => ({
                end: (buffer) => cb(new Error('Upload failed'), null)
            }));
            cloudinary.uploader = { upload_stream: mockUploadStream };

            const file = { buffer: Buffer.from('test') };
            await expect(FieldComplexService.createFieldComplex(mockData, [file])).rejects.toThrow('Lỗi khi tải lên Cloudinary: Upload failed');
        });
    });

    describe('getAllFieldComplexes', () => {
        it('should return all field complexes with owner and staffs details', async () => {
            const mockComplexes = [
                {
                    _id: 'c1',
                    owner: { _id: 'o1', firebaseUID: 'uid1', toObject: () => ({ _id: 'o1', firebaseUID: 'uid1' }) },
                    staffs: [{ _id: 's1', firebaseUID: 'uid2', toObject: () => ({ _id: 's1', firebaseUID: 'uid2' }) }],
                    toObject: () => ({ _id: 'c1', owner: { _id: 'o1' }, staffs: [{ _id: 's1' }] })
                }
            ];
            FieldComplex.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockComplexes)
                })
            });

            admin.auth().getUsers = jest.fn().mockResolvedValue({
                users: [
                    { uid: 'uid1', email: 'owner@example.com', disabled: false },
                    { uid: 'uid2', email: 'staff@example.com', disabled: false }
                ]
            });

            const result = await FieldComplexService.getAllFieldComplexes();
            expect(Array.isArray(result)).toBe(true);
            expect(result[0]).toHaveProperty('owner.email', 'owner@example.com');
            expect(result[0].staffs[0]).toHaveProperty('email', 'staff@example.com');
        });

        it('should handle firebase error gracefully', async () => {
            const mockComplexes = [
                {
                    _id: 'c1',
                    owner: { _id: 'o1', firebaseUID: 'uid1', toObject: () => ({ _id: 'o1', firebaseUID: 'uid1' }) },
                    staffs: [],
                    toObject: () => ({ _id: 'c1', owner: { _id: 'o1' }, staffs: [] })
                }
            ];
            FieldComplex.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockComplexes)
                })
            });

            admin.auth().getUsers = jest.fn().mockRejectedValue(new Error('Firebase error'));

            const result = await FieldComplexService.getAllFieldComplexes();
            expect(result[0]).toHaveProperty('owner.email', null);
        });
    });

    describe('getFieldComplexById', () => {
        it('should return null if not found', async () => {
            FieldComplex.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(null)
                })
            });

            const result = await FieldComplexService.getFieldComplexById('c1');
            expect(result).toBeNull();
        });

        it('should return field complex with details', async () => {
            const mockComplex = {
                _id: 'c1',
                owner: { _id: 'o1', firebaseUID: 'uid1', toObject: () => ({ _id: 'o1', firebaseUID: 'uid1' }) },
                staffs: [{ _id: 's1', firebaseUID: 'uid2', toObject: () => ({ _id: 's1', firebaseUID: 'uid2' }) }],
                toObject: () => ({ _id: 'c1', owner: { _id: 'o1' }, staffs: [{ _id: 's1' }] })
            };
            FieldComplex.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockComplex)
                })
            });

            SportField.find.mockResolvedValue([{ _id: 'f1' }]);

            admin.auth().getUser = jest.fn()
                .mockResolvedValueOnce({ email: 'owner@example.com', disabled: false })
                .mockResolvedValueOnce({ email: 'staff@example.com', disabled: false });

            const result = await FieldComplexService.getFieldComplexById('c1');
            expect(result).toHaveProperty('_id', 'c1');
            expect(result).toHaveProperty('owner.email', 'owner@example.com');
            expect(result).toHaveProperty('sportFields');
            expect(result.staffs[0]).toHaveProperty('email', 'staff@example.com');
        });

        it('should handle firebase getUser error', async () => {
            const mockComplex = {
                _id: 'c1',
                owner: { _id: 'o1', firebaseUID: 'uid1', toObject: () => ({ _id: 'o1', firebaseUID: 'uid1' }) },
                staffs: [],
                toObject: () => ({ _id: 'c1', owner: { _id: 'o1' }, staffs: [] })
            };
            FieldComplex.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockComplex)
                })
            });

            SportField.find.mockResolvedValue([]);

            admin.auth().getUser = jest.fn().mockRejectedValue(new Error('Firebase error'));

            const result = await FieldComplexService.getFieldComplexById('c1');
            expect(result).toHaveProperty('owner.accountStatus', 'Unknown');
        });
    });

    describe('updateFieldComplex', () => {
        it('should update field complex without images', async () => {
            const mockData = { name: 'Updated Complex' };
            const mockUpdated = { _id: 'c1', ...mockData };
            FieldComplex.findByIdAndUpdate.mockResolvedValue(mockUpdated);

            const result = await FieldComplexService.updateFieldComplex('c1', mockData, []);
            expect(result).toEqual(mockUpdated);
            expect(FieldComplex.findByIdAndUpdate).toHaveBeenCalledWith('c1', mockData, { new: true });
        });

        it('should update field complex with images', async () => {
            const mockData = { name: 'Updated Complex 2' };
            const mockUpdated = { _id: 'c2', ...mockData, images: ['url2'] };
            FieldComplex.findByIdAndUpdate.mockResolvedValue(mockUpdated);

            uuidv4.mockReturnValue('uuid3');
            const mockUploadStream = jest.fn((options, cb) => ({
                end: (buffer) => cb(null, { secure_url: 'url2' })
            }));
            cloudinary.uploader = { upload_stream: mockUploadStream };

            const file = { buffer: Buffer.from('test') };
            const result = await FieldComplexService.updateFieldComplex('c2', mockData, [file]);
            expect(result).toEqual(mockUpdated);
            expect(mockData.images).toEqual(['url2']);
        });
    });

    describe('deleteFieldComplex', () => {
        it('should delete and return field complex', async () => {
            const mockDeleted = { _id: 'c1' };
            FieldComplex.findByIdAndDelete.mockResolvedValue(mockDeleted);

            const result = await FieldComplexService.deleteFieldComplex('c1');
            expect(result).toEqual(mockDeleted);
        });
    });

    describe('addStaffToFieldComplex', () => {
        it('should add staff if not already present', async () => {
            const mockComplex = {
                _id: 'c1',
                staffs: ['s1'],
                save: jest.fn().mockResolvedValue({ _id: 'c1', staffs: ['s1', 's2'] })
            };
            FieldComplex.findById.mockResolvedValue(mockComplex);

            const result = await FieldComplexService.addStaffToFieldComplex('c1', 's2');
            expect(result.staffs).toContain('s2');
            expect(mockComplex.save).toHaveBeenCalled();
        });

        it('should not add staff if already present', async () => {
            const mockComplex = {
                _id: 'c1',
                staffs: ['s1', 's2'],
                save: jest.fn()
            };
            FieldComplex.findById.mockResolvedValue(mockComplex);

            const result = await FieldComplexService.addStaffToFieldComplex('c1', 's2');
            expect(mockComplex.save).not.toHaveBeenCalled();
        });

        it('should return null if complex not found', async () => {
            FieldComplex.findById.mockResolvedValue(null);

            const result = await FieldComplexService.addStaffToFieldComplex('c1', 's2');
            expect(result).toBeNull();
        });
    });

    describe('removeStaffFromFieldComplex', () => {
        it('should remove staff if present', async () => {
            const mockComplex = {
                _id: 'c1',
                staffs: ['s1', 's2'],
                save: jest.fn().mockResolvedValue({ _id: 'c1', staffs: ['s1'] })
            };
            FieldComplex.findById.mockResolvedValue(mockComplex);

            const result = await FieldComplexService.removeStaffFromFieldComplex('c1', 's2');
            expect(result.staffs).not.toContain('s2');
            expect(mockComplex.save).toHaveBeenCalled();
        });

        it('should return null if complex not found', async () => {
            FieldComplex.findById.mockResolvedValue(null);

            const result = await FieldComplexService.removeStaffFromFieldComplex('c1', 's2');
            expect(result).toBeNull();
        });
    });
});