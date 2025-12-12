const https = require('https');

const apiKey = 'AIzaSyBImreoK_uD0UmCzwgfGXWRydmwsaXZINQ';
const model = 'gemini-1.5-flash';
const host = 'generativelanguage.googleapis.com';
const path = `/v1beta/models/${model}:generateContent?key=${apiKey}`;

const data = JSON.stringify({
    contents: [{
        parts: [{ text: "Hello, translate verify to Spanish" }]
    }]
});

const options = {
    hostname: host,
    path: path,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

console.log(`Testing Native Gemini API: https://${host}${path.split('?')[0]}...`);

const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    let body = '';
    res.on('data', (c) => body += c);
    res.on('end', () => console.log('Body:', body));
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
