const Type = require('../models/type.model');

class TypeService {
    async createType(typeData) {
        const type = new Type(typeData);
        return await type.save();
    }

    async getAllTypes() {
        return await Type.find();
    }

    async getTypeById(typeId) {
        return await Type.findById(typeId);
    }

    async updateType(typeId, typeData) {
        return await Type.findByIdAndUpdate(typeId, typeData, { new: true });
    }

    async deleteType(typeId) {
        return await Type.findByIdAndDelete(typeId);
    }
}

module.exports = new TypeService();