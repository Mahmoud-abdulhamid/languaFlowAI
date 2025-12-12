const https = require('https');

const apiKey = 'AIzaSyBImreoK_uD0UmCzwgfGXWRydmwsaXZINQ';
const baseUrl = 'generativelanguage.googleapis.com';
// Try the standard documented path for OpenAI compatibility
const path = '/v1beta/openai/chat/completions';

const data = JSON.stringify({
    model: "gemini-2.0-flash",
    messages: [{ role: "user", content: "Hello" }]
});

const options = {
    hostname: baseUrl,
    path: path,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    }
};

console.log(`Testing POST to: https://${baseUrl}${path}`);

const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);

    let body = '';
    res.on('data', (d) => body += d);
    res.on('end', () => {
        console.log('Body:', body);
    });
});

req.on('error', (e) => {
    console.error('Request Error:', e);
});

req.write(data);
req.end();
