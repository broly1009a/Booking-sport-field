const FieldComplex = require('../models/fieldComplex.model');
const SportField = require('../models/sportField.model');
const { User } = require('../models/index');
const admin = require('../configs/firebaseAdmin');
const cloudinary = require('../configs/cloudinary.config');
const { v4: uuidv4 } = require('uuid');

class FieldComplexService {
    async createFieldComplex(data, imageFiles = []) {
        let imageUrls = [];
        if (imageFiles.length > 0) {
            const uploadPromises = imageFiles.map(file =>
                new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        {
                            folder: 'field_complexes',
                            public_id: `field_complex_${uuidv4()}`,
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
        
        const fieldComplex = new FieldComplex({
            ...data,
            images: imageUrls.length > 0 ? imageUrls : data.images || []
        });
        return await fieldComplex.save();
    }


    async getAllFieldComplexes() {
        const complexes = await FieldComplex.find().populate('owner').populate('staffs');
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
            // Trả về thông tin staffs kèm email nếu có firebaseUID
            const staffsDetail = complex.staffs ? complex.staffs.map(staff => {
                let staffObj = staff.toObject();
                let email = null;
                if (staff.firebaseUID) {
                    const firebaseUser = firebaseUsers.find(fu => fu.uid === staff.firebaseUID);
                    email = firebaseUser ? firebaseUser.email : null;
                }
                return { ...staffObj, email };
            }) : [];
            return {
                ...complex.toObject(),
                owner: ownerDetail,
                staffs: staffsDetail
            };
        });
    }

    async getFieldComplexById(id) {
        const complex = await FieldComplex.findById(id).populate('owner').populate('staffs');
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
        // Lấy danh sách các sân thuộc cụm sân này
        const sportFields = await SportField.find({ complex: id });
        // Trả về thông tin staffs kèm email nếu có firebaseUID
        let staffsDetail = [];
        if (complex.staffs && complex.staffs.length > 0) {
            staffsDetail = await Promise.all(complex.staffs.map(async staff => {
                let staffObj = staff.toObject();
                let email = null;
                if (staff.firebaseUID) {
                    try {
                        const firebaseUser = await admin.auth().getUser(staff.firebaseUID);
                        email = firebaseUser.email;
                    } catch (error) {
                        email = null;
                    }
                }
                return { ...staffObj, email };
            }));
        }
        return {
            ...complex.toObject(),
            owner: ownerDetail,
            sportFields: sportFields.map(f => f.toObject()),
            staffs: staffsDetail
        };
    }

    async updateFieldComplex(id, data, imageFiles = []) {
        console.log('Updating Field Complex with data:', data);
        console.log('Number of image files to upload:', imageFiles);
        let imageUrls = [];
        if (imageFiles.length > 0) {
            const uploadPromises = imageFiles.map(file =>
                new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        {
                            folder: 'field_complexes',
                            public_id: `field_complex_${uuidv4()}`,
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
            data.images = imageUrls;
        }
        
        return await FieldComplex.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteFieldComplex(id) {
        return await FieldComplex.findByIdAndDelete(id);
    }

    async addStaffToFieldComplex(complexId, staffId) {
        // Thêm staffId vào mảng staffs nếu chưa có
        const complex = await FieldComplex.findById(complexId);
        if (!complex) return null;
        if (!complex.staffs) complex.staffs = [];
        if (!complex.staffs.includes(staffId)) {
            complex.staffs.push(staffId);
            await complex.save();
        }
        return complex;
    }

    async removeStaffFromFieldComplex(complexId, staffId) {
        // Xoá staffId khỏi mảng staffs
        const complex = await FieldComplex.findById(complexId);
        if (!complex) return null;
        if (!complex.staffs) complex.staffs = [];
        complex.staffs = complex.staffs.filter(id => id.toString() !== staffId);
        await complex.save();
        return complex;
    }
}

module.exports = new FieldComplexService();
