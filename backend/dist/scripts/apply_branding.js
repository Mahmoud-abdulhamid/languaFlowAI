"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const fs_1 = __importDefault(require("fs"));
// Configuration
const API_URL = 'http://localhost:5000/api/v1';
const ADMIN_EMAIL = 'super@example.com';
const ADMIN_PASS = '123456';
// Paths to generated assets (using the paths I know exist)
const LOGO_PATH = 'C:/Users/Al-Quods/.gemini/antigravity/brain/324f5495-26c5-4a8a-a1dc-8dbebe117282/linguaflow_logo_pro_1765115668069.png';
const FAVICON_PATH = 'C:/Users/Al-Quods/.gemini/antigravity/brain/324f5495-26c5-4a8a-a1dc-8dbebe117282/linguaflow_favicon_pro_1765115683168.png';
const applyBranding = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log('1. Authenticating...');
        const loginRes = yield axios_1.default.post(`${API_URL}/users/login`, {
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
        const logoForm = new form_data_1.default();
        logoForm.append('file', fs_1.default.createReadStream(LOGO_PATH));
        // Axios needs specific headers for form-data in Node
        const logoUploadRes = yield axios_1.default.post(`${API_URL}/settings/upload`, logoForm, {
            headers: Object.assign(Object.assign({}, headers), logoForm.getHeaders())
        });
        const logoUrl = logoUploadRes.data.url;
        console.log(`   Logo Uploaded: ${logoUrl}`);
        // Upload Favicon
        console.log('3. Uploading Favicon...');
        const faviconForm = new form_data_1.default();
        faviconForm.append('file', fs_1.default.createReadStream(FAVICON_PATH));
        const faviconUploadRes = yield axios_1.default.post(`${API_URL}/settings/upload`, faviconForm, {
            headers: Object.assign(Object.assign({}, headers), faviconForm.getHeaders())
        });
        const faviconUrl = faviconUploadRes.data.url;
        console.log(`   Favicon Uploaded: ${faviconUrl}`);
        // Update Settings
        console.log('4. Updating System Settings...');
        yield axios_1.default.post(`${API_URL}/settings`, { key: 'system_logo', value: logoUrl }, { headers });
        yield axios_1.default.post(`${API_URL}/settings`, { key: 'system_favicon', value: faviconUrl }, { headers });
        console.log('   Settings Updated!');
        console.log('Done! Please refresh the application to see changes.');
    }
    catch (error) {
        console.error('Error applying branding:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
    }
});
applyBranding();
