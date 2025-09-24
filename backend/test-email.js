require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

const testEmail = async () => {
  try {
    console.log('Testing email configuration...');
    console.log('SMTP Settings:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      email: process.env.SMTP_EMAIL,
      fromEmail: process.env.FROM_EMAIL
    });

    await sendEmail({
      email: 'enowethel954@gmail.com', // Replace with your actual test email
      subject: 'Test Email from CamRide',
      message: 'This is a test email to verify your email service is working correctly!'
    });

    console.log('✅ Test email sent successfully!');
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure you have "Less secure app access" enabled in Gmail settings');
    console.log('2. Or use an App-Specific Password instead of your main password');
    console.log('3. Check that your Gmail account allows SMTP connections');
  }
};

testEmail();
