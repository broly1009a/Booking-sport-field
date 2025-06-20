const multer = require('multer');

// Configure Multer to use memory storage
const storage = multer.memoryStorage();

const uploadFileMiddleware = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Giới hạn 2MB
    fileFilter: (req, file, cb) => {
        const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`File ${file.originalname} có định dạng không hợp lệ.`), false);
        }
    },
});

module.exports = uploadFileMiddleware;