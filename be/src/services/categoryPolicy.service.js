const CategoryPolicy = require('../models/categoryPolicy.model');

class CategoryPolicyService {
    async createCategory(data) {
        return await CategoryPolicy.create(data);
    }

    async getAllCategory() {
        return await CategoryPolicy.find();
    }

    async getCategoryById(id) {
        return await CategoryPolicy.findById(id);
    }

    async updateCategory(id, data) {
        return await CategoryPolicy.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteCategory(id) {
        return await CategoryPolicy.findByIdAndDelete(id);
    }
};

module.exports = new CategoryPolicyService();