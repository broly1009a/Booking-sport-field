const PolicyService = require('../services/policy.service');

class PolicyController {
    async createPolicy(req, res, next) {
        try {
            const result = await PolicyService.createPolicy(req.body);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getPolicy(req, res, next) {
        try {
            const result = await PolicyService.getPolicy();
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getPolicyById(req, res, next) {
        try {
            const policyId = req.params.id;
            const result = await PolicyService.getPolicyById(policyId);
            if (!result) {
                return res.status(404).json({ error: 'Policy not found' });
            }
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async updatePolicy(req, res, next) {
        try {
            const policyId = req.params.id;
            const policyData = req.body;
            const result = await PolicyService.updatePolicy(policyId, policyData);
            if (!result) {
                return res.status(404).json({ error: 'Policy not found' });
            }
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async deletePolicy(req, res, next) {
        try {
            const policyId = req.params.id;
            const result = await PolicyService.deletePolicy(policyId);
            if (!result) {
                return res.status(404).json({ error: 'Policy not found' });
            }
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PolicyController();