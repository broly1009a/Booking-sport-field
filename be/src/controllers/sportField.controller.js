const { SportFieldService } = require('../services/index');

const FieldComplex = require('../models/fieldComplex.model');
const SportField = require('../models/sportField.model');

class SportFieldController {
       
        async getSportFieldsByStaff(req, res, next) {
            const { staffId } = req.params;
            try {
                
                const complexes = await FieldComplex.find({ staffs: staffId }).select('_id');
                const complexIds = complexes.map(c => c._id);
          
                const fields = await SportField.find({ complex: { $in: complexIds }, isdeleted: false });
                res.status(200).json(fields);
            } catch (error) {
                next(error);
            }
        }
        async getSportFieldsByOwner(req, res, next) {
        const { ownerId } = req.params;
        try {
          
            const complexes = await FieldComplex.find({ owner: ownerId }).select('_id');
            const complexIds = complexes.map(c => c._id);

            const fields = await SportField.find({ complex: { $in: complexIds }, isdeleted: false });
            res.status(200).json(fields);
        } catch (error) {
            next(error);
        }
    }
    async getAllSportFields(req, res, next) {
        try {
            const sportFields = await SportFieldService.getAllSportFields();
            res.status(200).json(sportFields);
        } catch (error) {
          next(error);
        }
    }

    async getSportFieldById(req, res, next) {
        const { id } = req.params;
        try {
            const sportField = await SportFieldService.getSportFieldById(id);
            if (!sportField) {
                return res.status(404).json({ message: 'Sport field not found' });
            }
            res.status(200).json(sportField);
        } catch (error) {
            next(error);
        }
    }

    async createSportField(req, res, next) {
        try {
            const sportFieldData = req.body;
              if (typeof sportFieldData.amenities === "string") {
            sportFieldData.amenities = sportFieldData.amenities.split(",");
        }
            const imageFiles = req.files || [];
            const newSportField = await SportFieldService.createSportField(sportFieldData, imageFiles);
            res.status(201).json(newSportField);
        } catch (error) {
            next(error);
        }
    }

    async updateSportField(req, res, next) {
        const { id } = req.params;
        try {
            const sportFieldData = req.body;
              if (typeof sportFieldData.amenities === "string") {
            sportFieldData.amenities = sportFieldData.amenities.split(",");
        }
            const imageFiles = req.files || [];
            const updatedSportField = await SportFieldService.updateSportField(id, sportFieldData, imageFiles);
            if (!updatedSportField) {
                return res.status(404).json({ message: 'Sport field not found' });
            }
            res.status(200).json(updatedSportField);
        } catch (error) {
            next(error);
        }
    }

    async deleteSportField(req, res, next) {
        const { id } = req.params;
        try {
            const deletedBy = req.user ? req.user._id : null;
            const result = await SportFieldService.deleteAndArchiveSportField(id, deletedBy);
            if (!result) {
                return res.status(404).json({ message: 'Không tìm thấy sân thể thao' });
            }
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SportFieldController();