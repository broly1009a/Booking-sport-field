const Policy = require('../models/policy.model');

class PolicyService {
    async createPolicy(data) {
        return await Policy.create(data);
    }

    async getPolicy() {
        return await Policy.find().populate('categoryPolicyId');
    }

    async getPolicyById(id) {
        return await Policy.findById(id).populate('categoryPolicyId');
    }

    async updatePolicy(id, data) {
        return await Policy.findByIdAndUpdate(id, data, { new: true });
    }

    async deletePolicy(id) {
        return await Policy.findByIdAndDelete(id);
    }
}

module.exports = new PolicyService();