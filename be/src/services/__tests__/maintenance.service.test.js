const MaintenanceService = require('../maintenance.service');
const Maintenance = require('../../models/maintenance.model');
const SportField = require('../../models/sportField.model');
const Schedule = require('../../models/schedule.model');

jest.mock('../../models/maintenance.model');
jest.mock('../../models/sportField.model');
jest.mock('../../models/schedule.model');

describe('MaintenanceService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createMaintenance', () => {
        it('should throw if field not found', async () => {
            SportField.findById.mockResolvedValue(null);
            await expect(MaintenanceService.createMaintenance({
                fieldId: 'f1', startTime: new Date(), endTime: new Date(Date.now() + 3600000)
            })).rejects.toMatchObject({ status: 404 });
        });

        it('should throw if missing startTime or endTime', async () => {
            SportField.findById.mockResolvedValue({ _id: 'f1' });
            await expect(MaintenanceService.createMaintenance({
                fieldId: 'f1'
            })).rejects.toMatchObject({ status: 400 });
        });

        it('should throw if startTime >= endTime', async () => {
            SportField.findById.mockResolvedValue({ _id: 'f1' });
            const now = new Date();
            await expect(MaintenanceService.createMaintenance({
                fieldId: 'f1', startTime: now, endTime: now
            })).rejects.toMatchObject({ status: 400 });
        });

        it('should throw if overlap exists', async () => {
            SportField.findById.mockResolvedValue({ _id: 'f1' });
            Maintenance.findOne.mockResolvedValue({ _id: 'm1' });
            await expect(MaintenanceService.createMaintenance({
                fieldId: 'f1', startTime: new Date(), endTime: new Date(Date.now() + 3600000)
            })).rejects.toMatchObject({ status: 409 });
        });

        it('should create maintenance if valid', async () => {
            SportField.findById.mockResolvedValue({ _id: 'f1' });
            Maintenance.findOne.mockResolvedValue(null);
            Maintenance.create.mockResolvedValue({ _id: 'm1' });
            Schedule.findOne.mockResolvedValue(null);

            const result = await MaintenanceService.createMaintenance({
                fieldId: 'f1',
                startTime: new Date(),
                endTime: new Date(Date.now() + 3600000),
                description: 'desc',
                status: 'scheduled'
            });
            expect(result).toHaveProperty('_id', 'm1');
        });
    });

    describe('getAllMaintenances', () => {
        it('should return all maintenances', async () => {
            Maintenance.find.mockReturnValue({
                populate: jest.fn().mockResolvedValue([{ _id: 'm1' }])
            });
            const result = await MaintenanceService.getAllMaintenances();
            expect(result).toEqual([{ _id: 'm1' }]);
        });
    });

    describe('getMaintenanceById', () => {
        it('should return maintenance by id', async () => {
            Maintenance.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue({ _id: 'm1' })
            });
            const result = await MaintenanceService.getMaintenanceById('m1');
            expect(result).toHaveProperty('_id', 'm1');
        });
    });

    describe('updateMaintenance', () => {
        it('should throw if field not found when updating', async () => {
            SportField.findById.mockResolvedValue(null);
            await expect(MaintenanceService.updateMaintenance('m1', { fieldId: 'f1' }))
                .rejects.toMatchObject({ status: 404 });
        });

        it('should throw if startTime >= endTime when updating', async () => {
            SportField.findById.mockResolvedValue({ _id: 'f1' });
            const now = new Date();
            await expect(MaintenanceService.updateMaintenance('m1', {
                fieldId: 'f1', startTime: now, endTime: now
            })).rejects.toMatchObject({ status: 400 });
        });

        it('should throw if overlap exists when updating', async () => {
            SportField.findById.mockResolvedValue({ _id: 'f1' });
            Maintenance.findOne.mockResolvedValue({ _id: 'm2' });
            await expect(MaintenanceService.updateMaintenance('m1', {
                fieldId: 'f1',
                startTime: new Date(),
                endTime: new Date(Date.now() + 3600000)
            })).rejects.toMatchObject({ status: 409 });
        });

        it('should update and return maintenance if valid', async () => {
            SportField.findById.mockResolvedValue({ _id: 'f1' });
            Maintenance.findOne.mockResolvedValue(null);
            Maintenance.findByIdAndUpdate.mockReturnValue({
                populate: jest.fn().mockResolvedValue({ _id: 'm1', updated: true })
            });
            const result = await MaintenanceService.updateMaintenance('m1', {
                fieldId: 'f1',
                startTime: new Date(),
                endTime: new Date(Date.now() + 3600000)
            });
            expect(result).toHaveProperty('updated', true);
        });
    });

    describe('deleteMaintenance', () => {
        it('should delete and return maintenance', async () => {
            Maintenance.findByIdAndDelete.mockResolvedValue({ _id: 'm1' });
            const result = await MaintenanceService.deleteMaintenance('m1');
            expect(result).toHaveProperty('_id', 'm1');
        });
    });
});