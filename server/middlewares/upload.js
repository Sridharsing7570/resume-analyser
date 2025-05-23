const multer = require("multer");

const fileFilter = (req, file, cb) => {
    // Log the incoming file details
    console.log("Incoming file:", {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
    });

    if (
        file.mimetype === "application/pdf" ||
        file.mimetype === "application/msword" ||
        file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
        cb(null, true);
    } else {
        cb(new Error("Only PDF and Word documents are allowed"));
    }
};

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 1, // Only allow one file
    },
    fileFilter,
});

// Error handling middleware
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                error: "File too large",
                details: "File size should be less than 10MB",
            });
        }
        return res.status(400).json({
            error: "File upload error",
            details: err.message,
        });
    } else if (err) {
        return res.status(400).json({
            error: "File upload error",
            details: err.message,
        });
    }
    next();
};

module.exports = { upload, handleMulterError };
