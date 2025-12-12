const fs = require('fs');
const pdfLib = require('pdf-parse');

async function test() {
    console.log('KEYS:', Object.keys(pdfLib));
    if (pdfLib.PDFParse) {
        console.log('PDFParse type:', typeof pdfLib.PDFParse);
        console.log('PDFParse is class?', pdfLib.PDFParse.toString().startsWith('class'));
    }
}
test();
