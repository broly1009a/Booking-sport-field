const AuthMiddleware = require('./auth.middleware');
const ErrorHandle = require('./errorHandle.middleware');
const cloudinaryFileMiddleware = require('./cloudinary.middleware');
module.exports = {
    AuthMiddleware,
    ErrorHandle,
    cloudinaryFileMiddleware
}