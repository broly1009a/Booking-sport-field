const admin = require('../configs/firebaseAdmin');
const { User } = require('../models/index');

class AuthMiddleware {
    checkRoles = (allowedRoles) => {
        return async (req, res, next) => {
            const token = req.headers.authorization?.split(' ')[1];
            // console.log(token)
            if (!token) {
                if (!allowedRoles.includes('GUEST')) {
                    return res.status(401).json({
                        message: 'Invalid authentication token'
                    });
                } else {
                    return next();
                }
            }
            try {
                const decodedToken = await admin.auth().verifyIdToken(token);
                const firebaseUID = decodedToken.uid;
                const user = await User.findOne({ firebaseUID }).lean();
                if (!user) {
                    return res.status(404).json({
                        message: 'User not found'
                    })
                }
                if (!allowedRoles.includes(user.role)) {
                    return res.status(403).json({
                        message: 'Forbidden: Insufficient permission'
                    })
                }
                req.user = {
                    ...user,
                }
                next();
            } catch (error) {
                return res.status(401).json({
                    message: 'Invalid or expired token',
                    error: error.message
                })
            }
        }
    }
};

module.exports = new AuthMiddleware;
