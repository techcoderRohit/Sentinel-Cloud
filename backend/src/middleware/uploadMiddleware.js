const multer = require('multer');
const path = require('path');

// Storage configuration - uploads folder mein save hoga
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads/avatars'));
    },
    filename: function (req, file, cb) {
        // Unique filename: userId_timestamp.extension
        const ext = path.extname(file.originalname);
        const uniqueName = `avatar_${req.user._id}_${Date.now()}${ext}`;
        cb(null, uniqueName);
    }
});

// File filter - Sirf images allow karein
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (jpg, png, webp, gif) are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});

module.exports = upload;
