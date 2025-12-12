const axios = require('axios');

const API_URL = 'http://localhost:4000/api/v1';

const run = async () => {
    try {
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@example.com',
            password: '123456'
        });
        const token = loginRes.data.token;
        const user = loginRes.data.user; // Assuming user info is returned
        console.log('Logged in User ID:', user ? user.id : 'Not returned');

        // Also decode token if user not returned
        if (!user) {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            console.log('Token Payload:', jsonPayload);
        }

    } catch (e) {
        console.error(e);
    }
};

run();
