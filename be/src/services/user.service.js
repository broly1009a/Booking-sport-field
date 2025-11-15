const { User } = require('../models/index');
const admin = require('../configs/firebaseAdmin');
const { sendVerificationEmail, sendNewPassword } = require('../configs/nodemailer.config');
const { generateRandomPassword } = require('../utils/handleGenerate');
const FieldComplex = require('../models/fieldComplex.model');
class UserService {
    /**
    * author: XXX
    */
    getAllUsers = async () => {
        return await User.find();
    }

    /**
    * author: XXX
    */
    getUserByAccessToken = async (accessToken) => {
        const decodedToken = await admin.auth().verifyIdToken(accessToken);
        const firebaseUID = decodedToken?.uid;
        const user = await User.findOne({ firebaseUID });
        return user;
    }

    /**
    * author: XXX
    */
    signUp = async (
        fname, lname, dob, phoneNumber, email,
        gender, role, password
    ) => {
        let userRecord = null;
        let newUser = null;

        try {
            userRecord = await admin.auth().createUser({
                email: email,
                password: password,
                displayName: `${lname} ${fname}`,
                disabled: false,
            });

            newUser = await User.create([{
                fname,
                lname,
                dob,
                phoneNumber,
                email,
                gender,
                role,
                firebaseUID: userRecord.uid,
            }]);

            const emailVerificationLink = `${process.env.BE_HOST_URL}/api/v1/user/verify-email?uid=${userRecord.uid}`;
            await sendVerificationEmail(email, emailVerificationLink);

            return newUser[0];

        } catch (error) {
            if (userRecord && userRecord.uid) {
                await admin.auth().deleteUser(userRecord.uid);
            }

            if (error.code === 'auth/email-already-exists') {
                throw { message: 'Email đã tồn tại. Vui lòng sử dụng email khác.', status: 400 };
            }

            if (error.code === 'auth/invalid-phone-number') {
                throw { message: 'Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.', status: 400 };
            }

            throw { message: 'Lỗi tạo người dùng: ' + error.message, status: 500 };
        }
    };


    /**
    * author: XXX
    */
    updateCustomerInfo = async (fname, lname, dob, phoneNumber, gender, firebaseUID) => {
        const dbUser = await User.findOne({ firebaseUID });
        if (!dbUser) {
            throw { message: 'Không tìm thấy người dùng.', status: 404 };
        }

        dbUser.fname = fname || dbUser.fname;
        dbUser.lname = lname || dbUser.lname;
        dbUser.dob = dob || dbUser.dob;
        dbUser.phoneNumber = phoneNumber || dbUser.phoneNumber;
        dbUser.gender = gender || dbUser.gender;

        return await dbUser.save();
    };

    /**
    * author: XXX
    */
    verifyEmail = async (firebaseUID) => {
        try {
            return await admin.auth().updateUser(firebaseUID, { emailVerified: true });
        } catch (error) {
            console.error('Verify email error:', error);
            throw { 
                message: 'Có lỗi xảy ra khi xác minh tài khoản.', 
                status: 500,
                error: error.message 
            };
        }
    };

    /**
    * author: XXX
    */
    sendEmailVerification = async (email) => {
        try {
            const userRecord = await admin.auth().getUserByEmail(email);
            const emailVerificationLink = `${process.env.BE_HOST_URL}/api/v1/user/verify-email?uid=${userRecord.uid}`;
            await sendVerificationEmail(email, emailVerificationLink);
            return {
                data: {
                    success: true,
                    message: 'Đã gửi email xác thực.'
                }
            };
        } catch (error) {
            console.error('Send email verification error:', error);
            throw { 
                message: 'Email chưa được đăng ký!',
                status: 404,
                error: error.message 
            };
        }
    };


    /**
    * author: XXX
    */
    resetPassword = async (email) => {
        try {
            const userRecord = await admin.auth().getUserByEmail(email);
            console.log('User record found for password reset:', userRecord);
            const newPassword = generateRandomPassword();
            console.log('Generated new password:', newPassword);
            await admin.auth().updateUser(userRecord.uid, { password: newPassword });
            console.log('Password updated in Firebase for user:', userRecord.uid);
            await sendNewPassword(email, newPassword);
            console.log('New password email sent to:', email);
            return {
                data: {
                    success: true,
                    message: 'Mật khẩu mới đã được gửi qua email.'
                }
            };
        } catch (error) {
            console.error('Reset password error:', error);
            throw { 
                message: 'Email chưa được đăng ký!',
                status: 404,
                error: error.message 
            };
        }
    };

    getPaginatedUsers = async (page = 1, limit = 6, search = '', role = '') => {
        const skip = (page - 1) * limit;
        const query = {};

        if (search) {
            query.$or = [
                { fname: { $regex: search, $options: 'i' } },
                { lname: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } },
            ];
        }

        if (role) {
            query.role = role;
        }

        const users = await User.find(query)
            .populate('role', '_id name displayName')
            .skip(skip)
            .limit(Number(limit))
            .select('firebaseUID fname lname phoneNumber gender dob role groupCustomerId') // Chỉ lấy các trường cần thiết
            .exec();

        // Lấy thông tin Firebase cho nhiều người dùng
        const firebaseUIDs = users.map((user) => ({ uid: user.firebaseUID }));
        let firebaseUsers = [];
        try {
            const { users: firebaseUserRecords } = await admin.auth().getUsers(firebaseUIDs);
            firebaseUsers = firebaseUserRecords;
        } catch (error) {
            console.error('Error fetching Firebase users:', error);
        }

        const usersWithFirebaseData = users.map((user) => {
            const firebaseUser = firebaseUsers.find((fu) => fu.uid === user.firebaseUID);
            return {
                ...user.toObject(),
                email: firebaseUser ? firebaseUser.email : null,
                accountStatus: firebaseUser ? (firebaseUser.disabled ? 'Disabled' : 'Active') : 'Unknown',
            };
        });

        const totalRecords = await User.countDocuments(query);
        const totalPages = Math.ceil(totalRecords / limit);

        return {
            data: usersWithFirebaseData,
            meta: {
                total: totalRecords,
                totalPages,
                currentPage: parseInt(page),
                perPage: parseInt(limit),
            },
        };
    };
    signUpAndVerify = async (
        fname, lname, dob, phoneNumber, email,
        gender, role, password, restaurant = null, restaurants = null
    ) => {
        let userRecord = null;
        let newUser = null;
        // Kiểm tra số điện thoại đã tồn tại
        const existedPhone = await User.findOne({ phoneNumber });
        if (existedPhone) {
            throw { message: 'Số điện thoại đã tồn tại. Vui lòng sử dụng số khác.', status: 400 };
        }
        try {
            userRecord = await admin.auth().createUser({
                email: email,
                password: password,
                displayName: `${lname} ${fname}`,
                disabled: false,
                emailVerified: true, // Tự động xác minh email
            });

            newUser = await User.create([{
                fname,
                lname,
                dob,
                phoneNumber,
                email,
                gender,
                role,
                restaurant,
                restaurants,
                firebaseUID: userRecord.uid,
            }]);

            return newUser[0];

        } catch (error) {
            if (userRecord && userRecord.uid) {
                await admin.auth().deleteUser(userRecord.uid);
            }

            if (error.code === 'auth/email-already-exists') {
                throw { message: 'Email đã tồn tại. Vui lòng sử dụng email khác.', status: 400 };
            }

            if (error.code === 'auth/invalid-phone-number') {
                throw { message: 'Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.', status: 400 };
            }

            throw { message: 'Lỗi tạo người dùng: ' + error.message, status: 500 };
        }
    };
    updateAccountInfo = async (id, fname, lname, dob, phoneNumber, gender, role) => {
        const dbUser = await User.findById(id);
        if (!dbUser) {
            throw { message: 'Không tìm thấy người dùng.', status: 404 };
        }

        dbUser.fname = fname || dbUser.fname;
        dbUser.lname = lname || dbUser.lname;
        dbUser.dob = dob || dbUser.dob;
        dbUser.phoneNumber = phoneNumber || dbUser.phoneNumber;
        dbUser.gender = gender || dbUser.gender;
        dbUser.role = role || dbUser.role;

        return await dbUser.save();
    };
    getEmailByFirebaseUID = async (firebaseUID) => {
        try {
            const userRecord = await admin.auth().getUser(firebaseUID);
            if (!userRecord) {
                throw new Error('Không tìm thấy người dùng trong Firebase.');
            }
            return userRecord.email;
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw new Error('Không tìm thấy người dùng trong Firebase.');
        }
    };
    getEmailByPhoneNumber = async (phoneNumber) => {
        const user = await User.findOne({ phoneNumber });
        if (!user) throw { message: 'Không tìm thấy tài khoản với số điện thoại này.', status: 404 };
        const userRecord = await admin.auth().getUser(user.firebaseUID);
        return userRecord.email;
    };
    updateFirebaseAccountStatus = async (firebaseUID, disabled) => {
        try {
            await admin.auth().updateUser(firebaseUID, { disabled });
            return { message: `Tài khoản đã được ${disabled ? 'vô hiệu hóa' : 'kích hoạt lại'}.` };
        } catch (error) {
            console.error('Update account status error:', error);
            throw { 
                message: `Không thể cập nhật trạng thái tài khoản`,
                status: 500,
                error: error.message 
            };
        }
    };

    disableAccount = async (firebaseUID) => {
        return this.updateFirebaseAccountStatus(firebaseUID, true);
    };

    enableAccount = async (firebaseUID) => {
        return this.updateFirebaseAccountStatus(firebaseUID, false);
    };
        getUserById = async (id) => {
        const user = await User.findById(id).populate('role', '_id name displayName');
        if (!user) return null;
        let email = null;
        let accountStatus = 'Unknown';
        if (user.firebaseUID) {
            try {
                const firebaseUser = await admin.auth().getUser(user.firebaseUID);
                email = firebaseUser.email;
                accountStatus = firebaseUser.disabled ? 'Disabled' : 'Active';
            } catch (error) {
                // Không tìm thấy trên Firebase
            }
        }
        return {
            ...user.toObject(),
            email,
            accountStatus
        };
    };

        /**
        * Đồng bộ email từ Firebase cho tất cả user chưa có email
        */
        syncEmailsFromFirebase = async () => {
            try {
                // Lấy tất cả user chưa có email hoặc email null
                const usersWithoutEmail = await User.find({
                    $or: [
                        { email: { $exists: false } },
                        { email: null },
                        { email: '' }
                    ]
                });

                console.log(`[Sync Email] Tìm thấy ${usersWithoutEmail.length} user chưa có email`);

                let successCount = 0;
                let failCount = 0;

                for (const user of usersWithoutEmail) {
                    try {
                        // Lấy email từ Firebase
                        const firebaseUser = await admin.auth().getUser(user.firebaseUID);
                        
                        if (firebaseUser.email) {
                            // Cập nhật email vào MongoDB
                            user.email = firebaseUser.email;
                            await user.save();
                            successCount++;
                            console.log(`✓ Đã sync email cho user ${user.firebaseUID}: ${firebaseUser.email}`);
                        } else {
                            failCount++;
                            console.log(`✗ User ${user.firebaseUID} không có email trên Firebase`);
                        }
                    } catch (error) {
                        failCount++;
                        console.error(`✗ Lỗi sync email cho user ${user.firebaseUID}:`, error.message);
                    }
                }

                return {
                    success: true,
                    message: `Đã đồng bộ ${successCount}/${usersWithoutEmail.length} user. Thất bại: ${failCount}`,
                    data: { successCount, failCount, total: usersWithoutEmail.length }
                };
            } catch (error) {
                console.error('[Sync Email] Lỗi:', error);
                throw { message: 'Lỗi khi đồng bộ email: ' + error.message, status: 500 };
            }
        };

        /**
        * Lấy danh sách staff chưa được gán vào cụm sân nào
        */
        getAvailableStaff = async () => {
            // Lấy tất cả user có role STAFF
            const allStaffs = await User.find({ role: 'STAFF' });
            // Lấy tất cả staffs đã được gán vào bất kỳ FieldComplex nào
            const complexes = await FieldComplex.find({}, 'staffs');
            const assignedStaffIds = new Set();
            complexes.forEach(complex => {
                if (complex.staffs && complex.staffs.length > 0) {
                    complex.staffs.forEach(staffId => assignedStaffIds.add(staffId.toString()));
                }
            });
            // Lọc ra các staff chưa được gán
            const availableStaffs = allStaffs.filter(staff => !assignedStaffIds.has(staff._id.toString()));
            // Lấy email từ Firebase
            const firebaseUIDs = availableStaffs.map(staff => ({ uid: staff.firebaseUID })).filter(u => u.uid);
            let firebaseUsers = [];
            try {
                if (firebaseUIDs.length > 0) {
                    const { users: firebaseUserRecords } = await admin.auth().getUsers(firebaseUIDs);
                    firebaseUsers = firebaseUserRecords;
                }
            } catch (error) {
                // Nếu lỗi vẫn trả về danh sách không có email
            }
            return availableStaffs.map(staff => {
                const firebaseUser = firebaseUsers.find(fu => fu.uid === staff.firebaseUID);
                return {
                    ...staff.toObject(),
                    email: firebaseUser ? firebaseUser.email : null,
                    accountStatus: firebaseUser ? (firebaseUser.disabled ? 'Disabled' : 'Active') : 'Unknown',
                };
            });
        };
}

module.exports = new UserService;
