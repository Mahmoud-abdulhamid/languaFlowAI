console.log('Script loaded.');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const API_URL = 'http://localhost:4000/api/v1';

const login = async (email, password) => {
    try {
        const res = await axios.post(`${API_URL}/auth/login`, { email, password });
        return { token: res.data.token, user: res.data.user };
    } catch (e) {
        console.error('Login failed for', email, e.response?.data?.message || e.message);
        return null;
    }
};

const run = async () => {
    console.log('--- Starting Verification ---');

    // 1. Login Admin
    const admin = await login('admin@example.com', '123456');
    if (!admin) process.exit(1);
    console.log('Admin logged in:', admin.user.id);

    // 2. Login Translator (Sarah)
    const sarah = await login('sarah@example.com', '123456');
    if (!sarah) process.exit(1);
    console.log('Sarah logged in:', sarah.user.id);

    // 3. Create Project
    console.log('Creating Project...');
    // We need a dummy file
    if (!fs.existsSync('dummy.txt')) fs.writeFileSync('dummy.txt', 'This is a test file.');

    const form = new FormData();
    form.append('title', 'Notification Test Project ' + Date.now());
    form.append('sourceLang', 'en');
    form.append('targetLangs', 'es');
    form.append('deadline', '2025-12-31');
    form.append('files', fs.createReadStream('dummy.txt'));

    let projectId;
    try {
        const createRes = await axios.post(`${API_URL}/projects`, form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${admin.token}`
            }
        });
        projectId = createRes.data._id;
        console.log('Project Created:', projectId);
    } catch (e) {
        console.error('Create Project Failed:', e.response?.data || e.message);
        process.exit(1);
    }

    // 4. Assign Sarah
    console.log('Assigning Sarah...');
    try {
        await axios.post(`${API_URL}/projects/assign`, {
            projectId,
            translatorId: sarah.user.id
        }, {
            headers: { Authorization: `Bearer ${admin.token}` }
        });
        console.log('Assigned successfully.');
    } catch (e) {
        console.error('Assignment Failed:', e.response?.data || e.message);
    }

    // 5. Check Sarah's Notifications (Assigned)
    console.log('Checking Sarah Notifications (Assignment)...');
    try {
        const notifRes = await axios.get(`${API_URL}/notifications`, {
            headers: { Authorization: `Bearer ${sarah.token}` }
        });
        const assignedNotif = notifRes.data.find(n => n.type === 'INFO' && n.title === 'New Project Assignment' && n.link.includes(projectId));
        if (assignedNotif) {
            console.log('SUCCESS: Assignment Notification Found:', assignedNotif.message);
        } else {
            console.error('FAILURE: Assignment Notification NOT Found');
            console.log('Recent Notifications:', notifRes.data.slice(0, 3));
        }
    } catch (e) {
        console.error('Fetch Notif Failed:', e.message);
    }

    // 6. Remove Sarah
    console.log('Removing Sarah...');
    try {
        await axios.post(`${API_URL}/projects/remove-translator`, {
            projectId,
            translatorId: sarah.user.id
        }, {
            headers: { Authorization: `Bearer ${admin.token}` }
        });
        console.log('Removed successfully.');
    } catch (e) {
        console.error('Removal Failed:', e.response?.data || e.message);
    }

    // 7. Check Sarah's Notifications (Removed)
    console.log('Checking Sarah Notifications (Removal)...');
    try {
        const notifRes = await axios.get(`${API_URL}/notifications`, {
            headers: { Authorization: `Bearer ${sarah.token}` }
        });
        const removedNotif = notifRes.data.find(n => n.type === 'WARNING' && n.title === 'Project Assignment Removed' && n.link === '/projects'); // Based on my code
        if (removedNotif) {
            console.log('SUCCESS: Removal Notification Found:', removedNotif.message);
        } else {
            console.error('FAILURE: Removal Notification NOT Found');
            console.log('Recent Notifications:', notifRes.data.slice(0, 3));
        }
    } catch (e) {
        console.error('Fetch Notif Failed:', e.message);
    }

    // Cleanup
    if (fs.existsSync('dummy.txt')) fs.unlinkSync('dummy.txt');
    // Optionally delete project
};

run();
