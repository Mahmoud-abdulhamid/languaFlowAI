const axios = require('axios');

console.log('Starting script...');
const API_URL = 'http://localhost:4000';

const run = async () => {
    try {
        console.log('Pinging root...');
        const res = await axios.get(API_URL);
        console.log('Root status:', res.status, res.data);

        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/api/v1/auth/login`, {
            email: 'admin@example.com',
            password: '123456'
        });
        console.log('Login status:', loginRes.status);
        const token = loginRes.data.token;
        console.log('Token length:', token ? token.length : 0);

        console.log('Fetching notifications...');
        const notifRes = await axios.get(`${API_URL}/api/v1/notifications`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Notif status:', notifRes.status);
        console.log('Notif data:', JSON.stringify(notifRes.data));

    } catch (e) {
        console.error('Error:', e.message);
        if (e.response) console.error('Response:', e.response.status, e.response.data);
    }
};

run();
