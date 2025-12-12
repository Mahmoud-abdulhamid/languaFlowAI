const https = require('https');

const apiKey = 'AIzaSyBImreoK_uD0UmCzwgfGXWRydmwsaXZINQ';
const host = 'generativelanguage.googleapis.com';
const path = `/v1beta/models?key=${apiKey}`;

const options = {
    hostname: host,
    path: path,
    method: 'GET'
};

console.log(`Listing Models: https://${host}${path.split('?')[0]}...`);

const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    let body = '';
    res.on('data', (c) => body += c);
    const fs = require('fs');
    res.on('end', () => {
        try {
            const data = JSON.parse(body);
            if (data.models) {
                const names = data.models.map(m => m.name).join('\n');
                fs.writeFileSync('models.txt', names);
                console.log("Models written to models.txt");
            } else {
                console.log("No models found:", data);
            }
        } catch (e) {
            console.log("Error parsing:", e);
        }
    });
});

req.on('error', (e) => console.error(e));
req.end();
