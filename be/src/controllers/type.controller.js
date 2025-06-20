const { TypeService } = require('../services/index');

class TypeController {
    async createType(req, res, next) {
        try {
            const typeData = req.body;
            const type = await TypeService.createType(typeData);
            res.status(201).json(type);
        } catch (error) {
           next(error);
        }
    }

    async getAllTypes(req, res, next) {
        try {
            const types = await TypeService.getAllTypes();
            res.status(200).json(types);
        } catch (error) {
            next(error);
        }
    }

    async getTypeById(req, res, next) {
        try {
            const typeId = req.params.id;
            const type = await TypeService.getTypeById(typeId);
            if (!type) {
                return res.status(404).json({ error: 'Type not found' });
            }
            res.status(200).json(type);
        } catch (error) {
           next(error);
        }
    }

    async updateType(req, res, next) {
        try {
            const typeId = req.params.id;
            const typeData = req.body;
            const updatedType = await TypeService.updateType(typeId, typeData);
            if (!updatedType) {
                return res.status(404).json({ error: 'Type not found' });
            }
            res.status(200).json(updatedType);
        } catch (error) {
              next(error);
        }
    }

    async deleteType(req, res, next) {
        try {
            const typeId = req.params.id;
            const deletedType = await TypeService.deleteType(typeId);
            if (!deletedType) {
                return res.status(404).json({ error: 'Type not found' });
            }
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new TypeController();