  
const { EquipmentService } = require('../services/index');

class EquipmentController {

    async createEquipment(req, res) {
        try {
            const equipmentData = req.body;
            const equipment = await EquipmentService.createEquipment(equipmentData);
            return res.status(201).json({ success: true, data: equipment });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getAllEquipment(req, res) {
        try {
            const equipment = await EquipmentService.getAllEquipment();
            return res.status(200).json({ success: true, data: equipment });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getEquipmentById(req, res) {
        try {
            const { id } = req.params;
            const equipment = await EquipmentService.getEquipmentById(id);
            if (!equipment) {
                return res.status(404).json({ success: false, message: 'Equipment not found' });
            }
            return res.status(200).json({ success: true, data: equipment });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateEquipment(req, res) {
        try {
            const { id } = req.params;
            const equipmentData = req.body;
            const updatedEquipment = await EquipmentService.updateEquipment(id, equipmentData);
            if (!updatedEquipment) {
                return res.status(404).json({ success: false, message: 'Equipment not found' });
            }
            return res.status(200).json({ success: true, data: updatedEquipment });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async deleteEquipment(req, res) {
        try {
            const { id } = req.params;
            const deletedEquipment = await EquipmentService.deleteEquipment(id);
            if (!deletedEquipment) {
                return res.status(404).json({ success: false, message: 'Equipment not found' });
            }
            return res.status(200).json({ success: true, message: 'Equipment deleted successfully' });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getAvailableEquipmentBySportField(req, res) {
        try {
            const { sportFieldId } = req.params;
            const availableEquipment = await EquipmentService.getAvailableEquipmentBySportField(sportFieldId);
            return res.status(200).json({ success: true, data: availableEquipment });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    async getEquipmentBySportField(req, res) {
        try {
            const { sportFieldId } = req.params;
            const equipment = await EquipmentService.getEquipmentBySportField(sportFieldId);
            return res.status(200).json({ success: true, data: equipment });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getAllEquipmentByStaff(req, res) {
        try {
            const { staffId } = req.params;
            const equipment = await EquipmentService.getAllEquipmentByStaff(staffId);
            return res.status(200).json({ success: true, data: equipment });
        } catch (error) {
            return res.status(error.status || 500).json({ success: false, message: error.message });
        }
    }

}
module.exports = new EquipmentController();