const http = require('http');
const { Buffer } = require('buffer');

const testPasswordReset = async () => {
  try {
    console.log('🧪 Testing password reset functionality...');

    // Test email - you should have a user with this email in your database
    const testEmail = 'enowethel954@gmail.com'; // Replace with an email that exists in your database

    console.log(`📧 Sending password reset request for: ${testEmail}`);

    // Make HTTP request to your backend
    const postData = JSON.stringify({
      email: testEmail
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/forgotpassword',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Password reset request successful!');
          console.log('📋 Response:', response);

          if (response.success) {
            console.log('📬 Check your server console for email details (development mode)');
            console.log('🔗 Reset endpoint would be: http://localhost:5000/api/users/resetpassword/[TOKEN]');
          }
        } catch (e) {
          console.log('📋 Raw response:', data);
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ Request failed:', e.message);
      if (e.code === 'ECONNREFUSED') {
        console.log('💡 Make sure your backend server is running on port 5000');
        console.log('💡 Run: npm start (in the backend directory)');
      }
    });

    req.write(postData);
    req.end();

  } catch (error) {
    console.error('❌ Password reset test failed:', error.message);
  }
};

// Only run if this file is executed directly
if (require.main === module) {
  testPasswordReset();
}

module.exports = { testPasswordReset };
