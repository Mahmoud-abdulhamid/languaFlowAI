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
const testPdf = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('--- Testing pdf-parse import ---');
        const pdfLib = require('pdf-parse');
        console.log('Type of pdfLib:', typeof pdfLib);
        console.log('pdfLib keys:', Object.keys(pdfLib)); // if it's an object
        console.log('Is pdfLib a function?', typeof pdfLib === 'function');
        if (pdfLib.default) {
            console.log('Type of pdfLib.default:', typeof pdfLib.default);
        }
        const pdf = pdfLib.default || pdfLib;
        console.log('Selected pdf function type:', typeof pdf);
        // Create a dummy PDF buffer if possible or just stop here if we identified the import
        // If we want to test parsing, we need a file. 
        // Let's just check the import logic first.
    }
    catch (error) {
        console.error('Error in test script:', error);
    }
});
testPdf();
