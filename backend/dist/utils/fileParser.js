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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Use require to bypass potential missing @types packages
const mammoth = require('mammoth');
const pdfLib = require('pdf-parse');
const parseFile = (filePath, originalName) => __awaiter(void 0, void 0, void 0, function* () {
    const ext = path_1.default.extname(originalName).toLowerCase();
    // Helper to get PDF function safely for v1.1.1
    const getPdfParse = () => pdfLib.default || pdfLib;
    try {
        if (ext === '.txt') {
            const content = yield fs_1.default.promises.readFile(filePath, 'utf-8');
            return splitContent(content);
        }
        if (ext === '.docx') {
            const result = yield mammoth.extractRawText({ path: filePath });
            return splitContent(result.value || '');
        }
        if (ext === '.pdf') {
            const dataBuffer = yield fs_1.default.promises.readFile(filePath);
            const pdf = getPdfParse();
            const data = yield pdf(dataBuffer);
            return splitContent(data.text || '');
        }
        return ["Unsupported file type."];
    }
    catch (error) {
        console.error(`Error parsing file ${originalName}:`, error);
        return [`Error parsing file: ${originalName}`, `Details: ${error.message || error}`];
    }
});
exports.parseFile = parseFile;
const splitContent = (text) => {
    return text
        .split(/[\r\n]+/) // Split by newlines
        .map(line => line.trim())
        .filter(line => line.length > 0)
        // Remove consecutive duplicates (common for headers/footers in PDFs)
        .filter((line, index, arr) => index === 0 || line !== arr[index - 1]);
};
