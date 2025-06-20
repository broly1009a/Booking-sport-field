const { User } = require('../models/index');
const admin = require('../configs/firebaseAdmin');
const { serverHostPort, serverHostUrl } = require('../utils/constants');
const { sendVerificationEmail, sendNewPassword } = require('../configs/nodemailer.config');
const { generateRandomPassword } = require('../utils/handleGenerate');
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
                gender,
                role,
                firebaseUID: userRecord.uid,
            }]);

            const emailVerificationLink = `http://${serverHostUrl}:${serverHostPort}/api/v1/user/verify-email?uid=${userRecord.uid}`;
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
            throw { message: 'Có lỗi xảy ra khi xác minh tài khoản.', status: 500 };
        }
    };

    /**
    * author: XXX
    */
    sendEmailVerification = async (email) => {
        try {
            const userRecord = await admin.auth().getUserByEmail(email);
            const emailVerificationLink = `http://${serverHostUrl}:${serverHostPort}/api/v1/user/verify-email?uid=${userRecord.uid}`;
            await sendVerificationEmail(email, emailVerificationLink);
            return {
                data: {
                    success: true,
                    message: 'Đã gửi email xác thực.'
                }
            };
        } catch (error) {
            throw new Error('Email chưa được đăng ký!');
        }
    };


    /**
    * author: XXX
    */
    resetPassword = async (email) => {
        try {
            const userRecord = await admin.auth().getUserByEmail(email);
            const newPassword = generateRandomPassword();
            await admin.auth().updateUser(userRecord.uid, { password: newPassword });
            await sendNewPassword(email, newPassword);
            return {
                data: {
                    success: true,
                    message: 'Mật khẩu mới đã được gửi qua email.'
                }
            };
        } catch (error) {
            throw new Error('Email chưa được đăng ký!');
        }

    };

    getPaginatedUsers = async (page = 1, limit = 10, search = '', role = '') => {
        const skip = (page - 1) * limit;
        const query = {};

        if (search) {
            query.$or = [
                { fname: { $regex: search, $options: 'i' } },
                { lname: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } }
            ];
        }

        if (role) {
            query.role = role;
        }

        const users = await User.find(query)
            .skip(skip)
            .limit(Number(limit))
            .exec();

        // Lấy email từ Firebase và gán lại vào users
        const usersWithEmail = await Promise.all(users.map(async (user) => {
            try {
                const userRecord = await admin.auth().getUser(user.firebaseUID);
                user.firebaseUID = userRecord.email;
            } catch (error) {
                console.error(`Error fetching email for user ${user.firebaseUID}:`, error);
            }
            return user;
        }));

        const totalRecords = await User.countDocuments(query);
        const totalPages = Math.ceil(totalRecords / limit);

        return {
            data: usersWithEmail,
            meta: {
                total: totalRecords,
                totalPages,
                currentPage: parseInt(page),
                perPage: parseInt(limit)
            }
        };
    }
    signUpAndVerify = async (
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
                emailVerified: true, // Tự động xác minh email
            });

            newUser = await User.create([{
                fname,
                lname,
                dob,
                phoneNumber,
                gender,
                role,
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
}

module.exports = new UserService;
