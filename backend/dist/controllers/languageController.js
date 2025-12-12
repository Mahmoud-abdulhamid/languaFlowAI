"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLanguage = exports.updateLanguage = exports.createLanguage = exports.getAllLanguages = void 0;
const Language_1 = require("../models/Language");
const zod_1 = require("zod");
const getAllLanguages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const languages = yield Language_1.Language.find().sort({ name: 1 });
        res.json(languages);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAllLanguages = getAllLanguages;
const createLanguage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schema = zod_1.z.object({
            name: zod_1.z.string(),
            code: zod_1.z.string().min(2),
            nativeName: zod_1.z.string(),
            direction: zod_1.z.enum(['ltr', 'rtl']).optional()
        });
        const data = schema.parse(req.body);
        const existing = yield Language_1.Language.findOne({ code: data.code });
        if (existing)
            return res.status(400).json({ message: 'Language code already exists' });
        const language = yield Language_1.Language.create(data);
        res.status(201).json(language);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.createLanguage = createLanguage;
const updateLanguage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const language = yield Language_1.Language.findByIdAndUpdate(id, req.body, { new: true });
        if (!language)
            return res.status(404).json({ message: 'Language not found' });
        res.json(language);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.updateLanguage = updateLanguage;
const deleteLanguage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield Language_1.Language.findByIdAndDelete(id);
        res.json({ message: 'Language deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteLanguage = deleteLanguage;
