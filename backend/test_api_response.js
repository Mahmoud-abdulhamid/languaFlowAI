const axios = require('axios');

const API_URL = 'http://localhost:4000/api/v1';

const run = async () => {
    try {
        // 1. Login
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@example.com',
            password: '123456'
        });
        const token = loginRes.data.token;
        console.log('Got Token:', token ? 'Yes' : 'No');

        if (!token) {
            console.error('No token received');
            process.exit(1);
        }

        // 2. Get Notifications
        try {
            const notifRes = await axios.get(`${API_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Status:', notifRes.status);
            console.log('Data Type:', Array.isArray(notifRes.data) ? 'Array' : typeof notifRes.data);
            console.log('Data Length:', notifRes.data.length);
            if (Array.isArray(notifRes.data) && notifRes.data.length > 0) {
                console.log('First Notification:', JSON.stringify(notifRes.data[0], null, 2));
            } else {
                console.log('Full Response Data:', JSON.stringify(notifRes.data, null, 2));
            }

        } catch (err) {
            console.error('Error fetching notifications:', err.response ? err.response.data : err.message);
        }

        // 3. Get Unread Count
        try {
            const countRes = await axios.get(`${API_URL}/notifications/unread-count`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Unread Count:', countRes.data);
        } catch (err) {
            console.error('Error fetching count:', err.message);
        }

    } catch (e) {
        console.error('Login failed:', e.response ? e.response.data : e.message);
        process.exit(1);
    }
};

run();
