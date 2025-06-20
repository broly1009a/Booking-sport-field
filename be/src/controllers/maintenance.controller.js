const MaintenanceService = require('../services/maintenance.service');

class MaintenanceController {
    async createMaintenance(req, res, next) {
        try {
            const data = req.body;
            const maintenance = await MaintenanceService.createMaintenance(data);
            res.status(201).json({ success: true, data: maintenance });
        } catch (error) {
            next(error);
        }
    }

    async getAllMaintenances(req, res, next) {
        try {
            const maintenances = await MaintenanceService.getAllMaintenances();
            res.status(200).json({ success: true, data: maintenances });
        } catch (error) {
            next(error);
        }
    }

    async getMaintenanceById(req, res, next) {
        try {
            const { id } = req.params;
            const maintenance = await MaintenanceService.getMaintenanceById(id);
            if (!maintenance) {
                return res.status(404).json({ success: false, message: 'Maintenance not found' });
            }
            res.status(200).json({ success: true, data: maintenance });
        } catch (error) {
            next(error);
        }
    }

    async updateMaintenance(req, res, next) {
        try {
            const { id } = req.params;
            const data = req.body;
            const updated = await MaintenanceService.updateMaintenance(id, data);
            if (!updated) {
                return res.status(404).json({ success: false, message: 'Maintenance not found' });
            }
            res.status(200).json({ success: true, data: updated });
        } catch (error) {
            next(error);
        }
    }

    async deleteMaintenance(req, res, next) {
        try {
            const { id } = req.params;
            const deleted = await MaintenanceService.deleteMaintenance(id);
            if (!deleted) {
                return res.status(404).json({ success: false, message: 'Maintenance not found' });
            }
            res.status(200).json({ success: true, message: 'Maintenance deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new MaintenanceController();