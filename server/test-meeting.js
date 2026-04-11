const axios = require('axios');

async function testMeeting() {
  try {
    // 1. Login
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'sarah@techwave.io',
      password: 'password123'
    });
    
    const token = loginRes.data.token;
    console.log('Logged in successfully, token:', token.substring(0, 20) + '...');
    
    // 2. Schedule Meeting
    const meetingRes = await axios.post('http://localhost:5000/api/meetings', {
      title: 'Startup Pitch Discussion',
      entrepreneurId: loginRes.data.user._id,
      investorId: '65f0a8b79f1b9c001f3e7a3d', // just a dummy id
      date: '2026-05-15',
      startTime: '14:00',
      durationMinutes: 30,
      notes: 'Testing meeting scheduling API'
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Meeting scheduled successfully:', meetingRes.data.title);
    
    // 3. Get Meetings
    const getRes = await axios.get('http://localhost:5000/api/meetings', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Total meetings for user:', getRes.data.length);
  } catch (error) {
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testMeeting();
