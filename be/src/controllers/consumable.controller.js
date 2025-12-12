const { ConsumableService } = require('../services/index');

class ConsumableController {
    async createConsumable(req, res) {
        try {
            const consumableData = req.body;
            const consumable = await ConsumableService.createConsumable(consumableData);
            return res.status(201).json({ success: true, data: consumable });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getAllConsumables(req, res) {
        try {
            const consumables = await ConsumableService.getAllConsumables();
            return res.status(200).json({ success: true, data: consumables });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getConsumableById(req, res) {
        try {
            const { id } = req.params;
            const consumable = await ConsumableService.getConsumableById(id);
            if (!consumable) {
                return res.status(404).json({ success: false, message: 'Consumable not found' });
            }
            return res.status(200).json({ success: true, data: consumable });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateConsumable(req, res) {
        try {
            const { id } = req.params;
            const consumableData = req.body;
            const updatedConsumable = await ConsumableService.updateConsumable(id, consumableData);
            if (!updatedConsumable) {
                return res.status(404).json({ success: false, message: 'Consumable not found' });
            }
            return res.status(200).json({ success: true, data: updatedConsumable });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async deleteConsumable(req, res) {
        try {
            const { id } = req.params;
            const deletedConsumable = await ConsumableService.deleteConsumable(id);
            if (!deletedConsumable) {
                return res.status(404).json({ success: false, message: 'Consumable not found' });
            }
            return res.status(200).json({ success: true, message: 'Consumable deleted successfully'
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
        async getAvailableConsumablesBySportField(req, res) {
        try {
            const { sportFieldId } = req.params;
            const consumables = await ConsumableService.getAvailableConsumablesBySportField(sportFieldId);
            return res.status(200).json({ success: true, data: consumables });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    async getAllConsumablesByStaff(req, res) {
        try {
            const { staffId } = req.params;
            const consumables = await ConsumableService.getAllConsumablesByStaff(staffId);
            return res.status(200).json({ success: true, data: consumables });
        } catch (error) {
            return res.status(error.status || 500).json({ success: false, message: error.message });
        }
    }
}
module.exports = new ConsumableController();