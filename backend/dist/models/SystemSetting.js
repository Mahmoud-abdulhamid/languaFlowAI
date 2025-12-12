"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemSetting = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const systemSettingSchema = new mongoose_1.default.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose_1.default.Schema.Types.Mixed, required: true },
    description: { type: String },
    updatedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
exports.SystemSetting = mongoose_1.default.model('SystemSetting', systemSettingSchema);
