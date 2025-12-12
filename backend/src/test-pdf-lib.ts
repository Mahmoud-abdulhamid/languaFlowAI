import fs from 'fs';
import path from 'path';

const testPdf = async () => {
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

    } catch (error) {
        console.error('Error in test script:', error);
    }
};

testPdf();
