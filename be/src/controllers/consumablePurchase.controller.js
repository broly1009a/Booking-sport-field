const ConsumablePurchaseService = require('../services/consumablePurchase.service');

class ConsumablePurchaseController {
    async create(req, res, next) {
        try {
            const data = req.body;
            const created = await ConsumablePurchaseService.create(data);
            res.status(201).json({ success: true, data: created });
        } catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const items = await ConsumablePurchaseService.getAll();
            res.status(200).json({ success: true, data: items });
        } catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const item = await ConsumablePurchaseService.getById(id);
            if (!item) return res.status(404).json({ success: false, message: 'Not found' });
            res.status(200).json({ success: true, data: item });
        } catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const data = req.body;
            const updated = await ConsumablePurchaseService.update(id, data);
            if (!updated) return res.status(404).json({ success: false, message: 'Not found' });
            res.status(200).json({ success: true, data: updated });
        } catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const deleted = await ConsumablePurchaseService.delete(id);
            if (!deleted) return res.status(404).json({ success: false, message: 'Not found' });
            res.status(200).json({ success: true, message: 'Deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ConsumablePurchaseController();