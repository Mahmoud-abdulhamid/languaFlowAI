
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

// Configuration
const API_URL = 'http://localhost:5000/api/v1';
const ADMIN_EMAIL = 'super@example.com';
const ADMIN_PASS = '123456';

// Paths to generated assets (using the paths I know exist)
const LOGO_PATH = 'C:/Users/Al-Quods/.gemini/antigravity/brain/324f5495-26c5-4a8a-a1dc-8dbebe117282/linguaflow_logo_pro_1765115668069.png';
const FAVICON_PATH = 'C:/Users/Al-Quods/.gemini/antigravity/brain/324f5495-26c5-4a8a-a1dc-8dbebe117282/linguaflow_favicon_pro_1765115683168.png';

const applyBranding = async () => {
    try {
        console.log('1. Authenticating...');
        const loginRes = await axios.post(`${API_URL}/users/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASS
        });
        const token = loginRes.data.token;
        console.log('   Success! Token received.');

        const headers = {
            'Authorization': `Bearer ${token}`
        };

        // Upload Logo
        console.log('2. Uploading Logo...');
        const logoForm = new FormData();
        logoForm.append('file', fs.createReadStream(LOGO_PATH));

        // Axios needs specific headers for form-data in Node
        const logoUploadRes = await axios.post(`${API_URL}/settings/upload`, logoForm, {
            headers: {
                ...headers,
                ...logoForm.getHeaders()
            }
        });
        const logoUrl = logoUploadRes.data.url;
        console.log(`   Logo Uploaded: ${logoUrl}`);

        // Upload Favicon
        console.log('3. Uploading Favicon...');
        const faviconForm = new FormData();
        faviconForm.append('file', fs.createReadStream(FAVICON_PATH));
        const faviconUploadRes = await axios.post(`${API_URL}/settings/upload`, faviconForm, {
            headers: {
                ...headers,
                ...faviconForm.getHeaders()
            }
        });
        const faviconUrl = faviconUploadRes.data.url;
        console.log(`   Favicon Uploaded: ${faviconUrl}`);

        // Update Settings
        console.log('4. Updating System Settings...');
        await axios.post(`${API_URL}/settings`, { key: 'system_logo', value: logoUrl }, { headers });
        await axios.post(`${API_URL}/settings`, { key: 'system_favicon', value: faviconUrl }, { headers });
        console.log('   Settings Updated!');

        console.log('Done! Please refresh the application to see changes.');

    } catch (error: any) {
        console.error('Error applying branding:', error.response?.data || error.message);
    }
};

applyBranding();
