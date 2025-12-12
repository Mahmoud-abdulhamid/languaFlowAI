"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_secret_key_change_in_prod_32'; // Must be 32 chars
const IV_LENGTH = 16; // For AES, this is always 16
const encrypt = (text) => {
    if (!text)
        return '';
    // If key is not 32 chars, pad or slice it (for dev safety, ideally strictly 32)
    const key = crypto_1.default.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substring(0, 32);
    const iv = crypto_1.default.randomBytes(IV_LENGTH);
    const cipher = crypto_1.default.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};
exports.encrypt = encrypt;
const decrypt = (text) => {
    if (!text)
        return '';
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const key = crypto_1.default.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substring(0, 32);
        const decipher = crypto_1.default.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }
    catch (e) {
        console.error('Decryption failed', e);
        return ''; // Return empty or original text if not encrypted properly
    }
};
exports.decrypt = decrypt;
