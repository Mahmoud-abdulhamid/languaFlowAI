import fs from 'fs';
import path from 'path';

// Use require to bypass potential missing @types packages
const mammoth = require('mammoth');
const pdfLib = require('pdf-parse');

export const parseFile = async (filePath: string, originalName: string): Promise<string[]> => {
    const ext = path.extname(originalName).toLowerCase();

    // Helper to get PDF function safely for v1.1.1
    const getPdfParse = () => pdfLib.default || pdfLib;

    try {
        if (ext === '.txt') {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            return splitContent(content);
        }

        if (ext === '.docx') {
            const result = await mammoth.extractRawText({ path: filePath });
            return splitContent(result.value || '');
        }

        if (ext === '.pdf') {
            const dataBuffer = await fs.promises.readFile(filePath);
            const pdf = getPdfParse();

            const data = await pdf(dataBuffer);
            return splitContent(data.text || '');
        }

        return ["Unsupported file type."];
    } catch (error: any) {
        console.error(`Error parsing file ${originalName}:`, error);
        return [`Error parsing file: ${originalName}`, `Details: ${error.message || error}`];
    }
};

const splitContent = (text: string): string[] => {
    return text
        .split(/[\r\n]+/) // Split by newlines
        .map(line => line.trim())
        .filter(line => line.length > 0)
        // Remove consecutive duplicates (common for headers/footers in PDFs)
        .filter((line, index, arr) => index === 0 || line !== arr[index - 1]);
};
