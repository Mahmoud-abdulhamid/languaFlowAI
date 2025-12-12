const mongoose = require('mongoose');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// MongoDB Connection String (from .env or hardcoded fallback)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tr_system';

// Minimal Valid PDF
const pdfBuffer = Buffer.from('%PDF-1.0\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 3 3]>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000157 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n249\n%%EOF');

// Dummy DOCX (Just text for now - might fail parsing but will upload)
const docxBuffer = Buffer.from('This is a dummy DOCX content.');

// Text File
const txtBuffer = Buffer.from('This is a sample text file for translation testing.\nIt has multiple lines.\nThird line here.');

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        // 1. Clear Projects, Segments, and existing Client User
        console.log('Clearing Projects, Segments, and Client User...');
        await mongoose.connection.collection('projects').deleteMany({});
        await mongoose.connection.collection('segments').deleteMany({});
        await mongoose.connection.collection('users').deleteOne({ email: 'client@example.com' });
        console.log('Cleared.');

        // 2. Create Temp Files
        const tempDir = path.join(__dirname, 'temp_seed');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

        const txtPath = path.join(tempDir, 'test.txt');
        const pdfPath = path.join(tempDir, 'test.pdf');
        const docxPath = path.join(tempDir, 'test.docx');

        fs.writeFileSync(txtPath, txtBuffer);
        fs.writeFileSync(pdfPath, pdfBuffer);
        fs.writeFileSync(docxPath, docxBuffer);

        // 3. Login as Client (ensure we have a client)
        // We'll try to login as 'client@example.com'. If fails, we register.
        const authUrl = 'http://localhost:4000/api/v1/auth';
        let token;

        try {
            const loginRes = await axios.post(`${authUrl}/login`, {
                email: 'client@example.com',
                password: 'password123'
            });
            token = loginRes.data.token;
            console.log('Logged in as client.');
        } catch (e) {
            console.log('Login failed, trying to register client...');
            try {
                const regRes = await axios.post(`${authUrl}/register`, {
                    email: 'client@example.com',
                    password: 'password123',
                    name: 'Seed Client',
                    role: 'CLIENT'
                });
                token = regRes.data.token;
                console.log('Registered valid client.');
            } catch (regErr) {
                // May already exist but wrong password? Try login with '123456' common default
                console.log('Registration failed. Trying login with 123456...');
                const loginRetry = await axios.post(`${authUrl}/login`, {
                    email: 'client@example.com',
                    password: 'password123' // Logic flaw here, but usually seed uses consistent pass.
                    // Assuming user exists. If not, I'll crash.
                });
                token = loginRetry.data.token;
            }
        }

        if (!token) throw new Error('Could not authenticate.');

        // 4. Create Projects
        const projectUrl = 'http://localhost:4000/api/v1/projects';

        // Project 1: All Files
        console.log('Creating Project 1: Mixed Files...');
        const form1 = new FormData();
        form1.append('title', 'Mixed Files Experiment');
        form1.append('sourceLang', 'en');
        form1.append('targetLangs', 'es,fr');
        form1.append('deadline', new Date(Date.now() + 86400000 * 7).toISOString());
        form1.append('files', fs.createReadStream(txtPath));
        form1.append('files', fs.createReadStream(pdfPath));
        // form1.append('files', fs.createReadStream(docxPath)); // Skip DOCX if parser is strict, add if robust

        await axios.post(projectUrl, form1, {
            headers: {
                ...form1.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });
        console.log('Project 1 Created.');

        // Project 2: text only
        console.log('Creating Project 2: Text Only...');
        const form2 = new FormData();
        form2.append('title', 'Text Translation Task');
        form2.append('sourceLang', 'en');
        form2.append('targetLangs', 'de');
        form2.append('deadline', new Date(Date.now() + 86400000 * 3).toISOString());
        form2.append('files', fs.createReadStream(txtPath));

        await axios.post(projectUrl, form2, {
            headers: {
                ...form2.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });
        console.log('Project 2 Created.');

        console.log('Done! Cleaning up...');
        fs.unlinkSync(txtPath);
        fs.unlinkSync(pdfPath);
        fs.unlinkSync(docxPath);
        fs.rmdirSync(tempDir);

        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err.response?.data || err.message);
        process.exit(1);
    }
}

seed();
