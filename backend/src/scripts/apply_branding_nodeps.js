
const http = require('http');
const fs = require('fs');
const path = require('path');

const API_HOST = 'localhost';
const API_PORT = 5000;
const ADMIN_EMAIL = 'super@example.com';
const ADMIN_PASS = '123456';

const LOGO_PATH = 'C:/Users/Al-Quods/.gemini/antigravity/brain/324f5495-26c5-4a8a-a1dc-8dbebe117282/linguaflow_logo_pro_1765115668069.png';
const FAVICON_PATH = 'C:/Users/Al-Quods/.gemini/antigravity/brain/324f5495-26c5-4a8a-a1dc-8dbebe117282/linguaflow_favicon_pro_1765115683168.png';

function request(method, path, headers, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: API_HOST,
            port: API_PORT,
            path: '/api/v1' + path,
            method: method,
            headers: headers
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve(data); // If not JSON
                    }
                } else {
                    reject({ statusCode: res.statusCode, data });
                }
            });
        });

        req.on('error', (e) => reject(e));

        if (body) {
            req.write(body);
        }
        req.end();
    });
}

async function uploadFile(filePath, token) {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const fileName = path.basename(filePath);
    const fileContent = fs.readFileSync(filePath);

    // Naive mimetype detection
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.png') contentType = 'image/png';
    if (ext === '.jpg') contentType = 'image/jpeg';
    if (ext === '.ico') contentType = 'image/x-icon';

    const header = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: ${contentType}\r\n\r\n`;
    const footer = `\r\n--${boundary}--`;

    const body = Buffer.concat([
        Buffer.from(header),
        fileContent,
        Buffer.from(footer)
    ]);

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length
    };

    return request('POST', '/settings/upload', headers, body);
}

async function run() {
    try {
        console.log('Authenticating...');
        const authData = JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASS });
        const loginRes = await request('POST', '/users/login', {
            'Content-Type': 'application/json',
            'Content-Length': authData.length
        }, authData);
        const token = loginRes.token;
        console.log('Token acquired.');

        console.log('Uploading Logo...');
        const logoRes = await uploadFile(LOGO_PATH, token);
        console.log('Logo URL:', logoRes.url);

        console.log('Uploading Favicon...');
        const faviconRes = await uploadFile(FAVICON_PATH, token);
        console.log('Favicon URL:', faviconRes.url);

        const authHeaders = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        console.log('Updating settings...');
        await request('POST', '/settings', authHeaders, JSON.stringify({ key: 'system_logo', value: logoRes.url }));
        await request('POST', '/settings', authHeaders, JSON.stringify({ key: 'system_favicon', value: faviconRes.url }));

        console.log('DONE! Branding applied successfully.');

    } catch (err) {
        console.error('Error:', err);
    }
}

run();
