const multer = require("multer");
const { HttpStatus } = require("../config/constants");

const storage = multer.memoryStorage();
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

class ImageUploadError extends Error {
    constructor(message, status = HttpStatus.BAD_REQUEST) {
        super(message);
        this.name = "ImageUploadError";
        this.status = status;
    }
}

const upload = multer({
    storage,
    limits: {
        fileSize: MAX_IMAGE_SIZE,
        files: 1,
    },
    fileFilter: (req, file, cb) => {
        if (ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new ImageUploadError(
                "Invalid image type. Only JPEG, PNG, and WebP files are allowed.",
                HttpStatus.UNSUPPORTED_MEDIA_TYPE,
            ));
        }
    }
});

const detectImageType = (buffer) => {
    if (!Buffer.isBuffer(buffer)) return null;

    const isPng = buffer.length >= 24
        && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        && buffer.subarray(12, 16).toString("ascii") === "IHDR"
        && buffer.readUInt32BE(16) > 0
        && buffer.readUInt32BE(20) > 0;
    if (isPng) return "image/png";

    const isJpeg = buffer.length >= 4
        && buffer[0] === 0xff
        && buffer[1] === 0xd8
        && buffer[2] === 0xff
        && buffer[buffer.length - 2] === 0xff
        && buffer[buffer.length - 1] === 0xd9;
    if (isJpeg) return "image/jpeg";

    const webpChunk = buffer.length >= 16 ? buffer.subarray(12, 16).toString("ascii") : "";
    const isWebp = buffer.length >= 16
        && buffer.subarray(0, 4).toString("ascii") === "RIFF"
        && buffer.subarray(8, 12).toString("ascii") === "WEBP"
        && ["VP8 ", "VP8L", "VP8X"].includes(webpChunk)
        && buffer.readUInt32LE(4) + 8 <= buffer.length;
    if (isWebp) return "image/webp";

    return null;
};

const validateImageContent = (req, _res, next) => {
    if (!req.file) return next();

    const detectedType = detectImageType(req.file.buffer);
    if (!detectedType || detectedType !== req.file.mimetype) {
        req.file.buffer.fill(0);
        req.file = undefined;
        return next(new ImageUploadError(
            "The uploaded file content does not match a valid JPEG, PNG, or WebP image.",
            HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        ));
    }

    return next();
};

const imageUploadErrorHandler = (error, _req, res, next) => {
    if (error instanceof multer.MulterError) {
        const isTooLarge = error.code === "LIMIT_FILE_SIZE";
        return res.status(isTooLarge ? HttpStatus.PAYLOAD_TOO_LARGE : HttpStatus.BAD_REQUEST).json({
            success: false,
            message: isTooLarge
                ? "Image exceeds the 5 MB file-size limit."
                : error.code === "LIMIT_UNEXPECTED_FILE"
                    ? "Use a single file field named image."
                    : error.message,
        });
    }

    if (error instanceof ImageUploadError) {
        return res.status(error.status).json({ success: false, message: error.message });
    }

    return next(error);
};

module.exports = {
    upload,
    validateImageContent,
    imageUploadErrorHandler,
};
