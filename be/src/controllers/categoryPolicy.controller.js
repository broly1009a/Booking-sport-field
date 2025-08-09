const CategoryPolicyService = require('../services/categoryPolicy.service');

class CategoryPolicyController {
    async createCategory(req, res, next) {
        try {
            const category = await CategoryPolicyService.createCategory(req.body);
            res.status(201).json(category);
        } catch (error) {
            next(error);
        }
    }

    async getAllCategory(req, res, next) {
        try {
            const category = await CategoryPolicyService.getAllCategory();
            res.status(200).json(category);
        } catch (error) {
            next(error);
        }
    }

    async getCategoryById(req, res, next) {
        try {
            const category = await CategoryPolicyService.getCategoryById(req.params.id);
            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }
            res.status(200).json(category);
        } catch (error) {
            next(error);
        }
    }

    async updateCategory(req, res, next) {
        try {
            const category = await CategoryPolicyService.updateCategory(req.params.id, req.body);
            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }
            res.status(200).json(category);
        } catch (error) {
            next(error);
        }
    }

    async deleteCategory(req, res, next) {
        try {
            const category = await CategoryPolicyService.deleteCategory(req.params.id);
            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CategoryPolicyController();