const { v4: uuidv4 } = require('uuid');
const sportFieldModel = require('../models/sportField.model');
const DeletedSportField = require('../models/deletedSportField.model');
const cloudinary = require('../configs/cloudinary.config');
const Booking = require('../models/booking.model');
class SportFieldService {
    async createSportField(sportFieldData, imageFiles = []) {
        let imageUrls = [];
        if (imageFiles.length > 0) {
            const uploadPromises = imageFiles.map(file =>
                new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        {
                            folder: 'sport_fields',
                            public_id: `sport_fields_${uuidv4()}`,
                        },
                        (error, result) => {
                            if (error) return reject(new Error(`Lỗi khi tải lên Cloudinary: ${error.message}`));
                            resolve(result);
                        }
                    ).end(file.buffer);
                })
            );
            const results = await Promise.all(uploadPromises);
            imageUrls = results.map(r => r.secure_url);
        }
        const sportField = new sportFieldModel({
            ...sportFieldData,
            images: imageUrls
        });
        return await sportField.save();
    }

    async getAllSportFields() {
        return await sportFieldModel.find().populate('type').populate('complex', 'name location images isActive');
    }

    async getSportFieldById(sportFieldId) {
        const sportField = await sportFieldModel.findById(sportFieldId).populate('type').populate('complex', 'name location images isActive');
        if (!sportField) return null;

       
        const similarFields = await sportFieldModel.find({
            _id: { $ne: sportFieldId },
            type: sportField.type._id,
          
        }).limit(5);

        return {
            ...sportField.toObject(),
            similarFields
        };
    }

    async updateSportField(sportFieldId, sportFieldData, imageFiles = []) {
        let imageUrls = [];
        if (imageFiles.length > 0) {
            const uploadPromises = imageFiles.map(file =>
                new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        {
                            folder: 'sport_fields',
                            public_id: `sport_fields_${uuidv4()}`,
                        },
                        (error, result) => {
                            if (error) return reject(new Error(`Lỗi khi tải lên Cloudinary: ${error.message}`));
                            resolve(result);
                        }
                    ).end(file.buffer);
                })
            );
            const results = await Promise.all(uploadPromises);
            imageUrls = results.map(r => r.secure_url);
        }

        if (imageUrls.length > 0) {
            sportFieldData.images = imageUrls;
        }
        return await sportFieldModel.findByIdAndUpdate(sportFieldId, sportFieldData, { new: true });
    }

    async deleteSportField(sportFieldId) {
        return await sportFieldModel.findByIdAndDelete(sportFieldId);
    }

    async deleteAndArchiveSportField(sportFieldId, deletedBy = null) {
        const sportField = await sportFieldModel.findById(sportFieldId);
        if (!sportField) return null;
        const hasBooking = await Booking.exists({ fieldId: sportFieldId });
        if (hasBooking) {
            const err = new Error('Không thể xóa sân đã từng có lịch đặt!');
            err.status = 400;
            throw err;
        }

        await DeletedSportField.create({
            originalId: sportField._id,
            name: sportField.name,
            type: sportField.type,
            location: sportField.location,
            capacity: sportField.capacity,
            status: sportField.status,
            pricePerHour: sportField.pricePerHour,
            amenities: sportField.amenities,
            images: sportField.images,
            deletedBy: deletedBy || undefined
        });

        await sportFieldModel.findByIdAndDelete(sportFieldId);
        return true;
    }
}

module.exports = new SportFieldService();