const nodemailer = require('nodemailer');

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_EMAIL, // Changed from SMTP_USERNAME to SMTP_EMAIL
    pass: process.env.SMTP_PASSWORD,
  },
});

// Async function to send an email
const sendEmail = async (options) => {
  // If in development, log the email instead of sending it
  if (process.env.NODE_ENV === 'development') {
    console.log('Email not sent in development. Email details:', {
      to: options.email,
      subject: options.subject,
      message: options.message,
    });
    return { message: 'Email not sent in development' };
  }

  // Define email options
  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // Send email
  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Email could not be sent: ${error.message}`);
  }
};

module.exports = sendEmail;
