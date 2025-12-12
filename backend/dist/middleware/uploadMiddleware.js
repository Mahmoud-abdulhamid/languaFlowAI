"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ensure upload directory exists
const uploadDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        console.log('Multer Destination called for:', file.originalname);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + '-' + file.originalname;
        console.log('Multer Filename generated:', filename);
        cb(null, filename);
    }
});
// Temporarily disabled filter for debugging
/*
const fileFilter = async (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    try {
        console.log('Processing upload:', file.originalname, file.mimetype);
        const allowedTypesRaw = await getSystemSetting('allowed_file_types');
        const allowedTypes = (allowedTypesRaw as string[]) || ['.pdf', '.docx', '.txt'];

        const fileExt = path.extname(file.originalname).toLowerCase();
        console.log('File Extension:', fileExt);

        // Always allow images for system assets
        const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg'];
        const imageMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/x-icon', 'image/svg+xml'];
        
        if (imageExtensions.includes(fileExt) || imageMimes.includes(file.mimetype)) {
            console.log('Allowed image type');
            cb(null, true);
            return;
        }

        if (allowedTypes.includes(fileExt)) {
            cb(null, true);
        } else {
            console.log('Checking fallback mime types for:', fileExt);
            // Basic mimetype check fallback
            const mimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/json'];
            if (mimes.includes(file.mimetype) && allowedTypes.some(ext => ext.includes(fileExt))) {
                cb(null, true);
            } else {
                console.log('Blocked file type:', fileExt);
                cb(new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`));
            }
        }
    } catch (err) {
        console.error("Upload validation error", err);
        cb(new Error('Upload validation failed'));
    }
};
*/
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    // fileFilter: fileFilter
});
