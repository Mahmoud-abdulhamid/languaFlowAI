const pdf = require('pdf-parse');
console.log('Typeof:', typeof pdf);
console.log('Is Function:', typeof pdf === 'function');
console.log('Keys:', Object.keys(pdf));
if (typeof pdf === 'object') {
    console.log('pdf.default:', typeof pdf.default);
    console.log('Full Object:', pdf);
} else {
    console.log('It is a function/value:', pdf);
}
