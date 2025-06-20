const { v4: uuidv4 } = require('uuid');
const sportFieldModel = require('../models/sportField.model');
const cloudinary = require('../configs/cloudinary.config');

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
        return await sportFieldModel.find().populate('type');
    }

   async getSportFieldById(sportFieldId) {
    const sportField = await sportFieldModel.findById(sportFieldId).populate('type');
    if (!sportField) return null;

    // Tìm các sân cùng loại, khác id, cùng location (hoặc có thể chỉ cùng loại)
    const similarFields = await sportFieldModel.find({
        _id: { $ne: sportFieldId },
        type: sportField.type._id,
        // location: sportField.location // Nếu muốn chỉ cùng loại, bỏ dòng này
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
}

module.exports = new SportFieldService();