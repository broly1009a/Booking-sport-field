const FieldComplex = require('../models/fieldComplex.model');
const { User } = require('../models/index');
const admin = require('../configs/firebaseAdmin');
class FieldComplexService {
    async createFieldComplex(data) {
        const fieldComplex = new FieldComplex(data);
        return await fieldComplex.save();
    }


    async getAllFieldComplexes() {
        const complexes = await FieldComplex.find().populate('owner');
        // Lấy danh sách owner hợp lệ
        const owners = complexes.map(c => c.owner).filter(Boolean);
        const firebaseUIDs = owners.map((user) => ({ uid: user.firebaseUID })).filter(u => u.uid);
        let firebaseUsers = [];
        try {
            if (firebaseUIDs.length > 0) {
                const { users: firebaseUserRecords } = await admin.auth().getUsers(firebaseUIDs);
                firebaseUsers = firebaseUserRecords;
            }
        } catch (error) {
            console.error('Error fetching Firebase users:', error);
        }
        return complexes.map(complex => {
            let owner = complex.owner;
            let ownerDetail = null;
            if (owner) {
                const firebaseUser = firebaseUsers.find(fu => fu.uid === owner.firebaseUID);
                ownerDetail = {
                    ...owner.toObject(),
                    email: firebaseUser ? firebaseUser.email : null,
                    accountStatus: firebaseUser ? (firebaseUser.disabled ? 'Disabled' : 'Active') : 'Unknown',
                };
            }
            return {
                ...complex.toObject(),
                owner: ownerDetail
            };
        });
    }

    async getFieldComplexById(id) {
        const complex = await FieldComplex.findById(id).populate('owner');
        if (!complex) return null;
        let ownerDetail = null;
        if (complex.owner && complex.owner.firebaseUID) {
            try {
                const firebaseUser = (await admin.auth().getUser(complex.owner.firebaseUID));
                ownerDetail = {
                    ...complex.owner.toObject(),
                    email: firebaseUser.email,
                    accountStatus: firebaseUser.disabled ? 'Disabled' : 'Active',
                };
            } catch (error) {
                ownerDetail = {
                    ...complex.owner.toObject(),
                    email: null,
                    accountStatus: 'Unknown',
                };
            }
        }
        return {
            ...complex.toObject(),
            owner: ownerDetail
        };
    }

    async updateFieldComplex(id, data) {
        return await FieldComplex.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteFieldComplex(id) {
        return await FieldComplex.findByIdAndDelete(id);
    }
}

module.exports = new FieldComplexService();
