const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function verifyBackend() {
    console.log('🚀 Starting Backend Verification...');

    // 1. Health Check
    try {
        const health = await axios.get(`${API_URL}/health`);
        console.log('✅ Health Check Passed:', health.data);
    } catch (error) {
        console.error('❌ Health Check Failed:', error.message);
        process.exit(1);
    }

    // Generate random user
    const uniqueId = Date.now();
    const user = {
        fullName: `Test User ${uniqueId}`,
        email: `test${uniqueId}@example.com`,
        password: 'password123'
    };

    let token = null;

    // 2. Signup
    try {
        const signup = await axios.post(`${API_URL}/api/auth/signup`, user);
        console.log('✅ Signup Passed:', signup.data.message);
    } catch (error) {
        console.error('❌ Signup Failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }

    // 3. Login
    try {
        const login = await axios.post(`${API_URL}/api/auth/login`, {
            email: user.email,
            password: user.password
        });
        token = login.data.token;
        console.log('✅ Login Passed');
    } catch (error) {
        console.error('❌ Login Failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }

    // 4. Create Resume
    try {
        const resume = await axios.post(`${API_URL}/api/resumes`, {
            personalInfo: {
                fullName: user.fullName,
                email: user.email,
                phone: '1234567890'
            }
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Create Resume Passed');
    } catch (error) {
        console.error('❌ Create Resume Failed:', error.response ? error.response.data : error.message);
    }

    console.log('🎉 Backend Verification Complete!');
}

verifyBackend();
