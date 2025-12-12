const pdfLib = require('pdf-parse');

const run = async () => {
    console.log('--- TEST START ---');
    const { PDFParse } = pdfLib;

    if (!PDFParse) {
        console.error('PDFParse class not found!');
        return;
    }

    const dummyBuffer = Buffer.from('dummy pdf content');
    console.log('Dummy Buffer is Buffer?', Buffer.isBuffer(dummyBuffer));
    console.log('Dummy Buffer is Uint8Array?', dummyBuffer instanceof Uint8Array);

    // Test 1: Direct Buffer
    try {
        console.log('\nTest 1: Direct Buffer');
        new PDFParse(dummyBuffer);
        console.log('SUCCESS');
    } catch (e) {
        console.log('FAILED:', e.message);
    }

    // Test 2: new Uint8Array(buffer)
    try {
        console.log('\nTest 2: new Uint8Array(buffer)');
        const arr = new Uint8Array(dummyBuffer);
        console.log('arr is Buffer?', Buffer.isBuffer(arr)); // In Node, this might still be true?
        new PDFParse(arr);
        console.log('SUCCESS');
    } catch (e) {
        console.log('FAILED:', e.message);
    }

    // Test 3: Spread into new Uint8Array (force copy)
    try {
        console.log('\nTest 3: Spread [...buffer]');
        const arr = new Uint8Array([...dummyBuffer]);
        console.log('arr is Buffer?', Buffer.isBuffer(arr));
        new PDFParse(arr);
        console.log('SUCCESS');
    } catch (e) {
        console.log('FAILED:', e.message);
    }

    // Test 4: ArrayBuffer slice
    try {
        console.log('\nTest 4: ArrayBuffer slice');
        const ab = dummyBuffer.buffer.slice(dummyBuffer.byteOffset, dummyBuffer.byteOffset + dummyBuffer.byteLength);
        const arr = new Uint8Array(ab);
        console.log('arr is Buffer?', Buffer.isBuffer(arr));
        new PDFParse(arr);
        console.log('SUCCESS');
    } catch (e) {
        console.log('FAILED:', e.message);
    }
};

run();
