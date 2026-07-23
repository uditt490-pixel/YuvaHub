const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configure the email transport using environment variables or a secure service
// For production, it's recommended to use a service like SendGrid, Mailgun, or AWS SES
const transporter = nodemailer.createTransport({
  host: functions.config().smtp ? functions.config().smtp.host : 'smtp.gmail.com',
  port: functions.config().smtp ? functions.config().smtp.port : 465,
  secure: true,
  auth: {
    user: functions.config().smtp ? functions.config().smtp.user : 'no-reply@yuvahub.com',
    pass: functions.config().smtp ? functions.config().smtp.pass : 'dummy-password'
  }
});

exports.sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
  const email = user.email;
  const displayName = user.displayName || 'New User';

  if (!email) {
    console.log('No email available for user:', user.uid);
    return null;
  }

  const mailOptions = {
    from: '"YuvaHub" <no-reply@yuvahub.com>',
    to: email,
    subject: 'Welcome to YuvaHub!',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome to YuvaHub, ${displayName}!</h2>
        <p>We are thrilled to have you join our community.</p>
        <p>At YuvaHub, you can explore the best opportunities, hackathons, and mentorship programs to accelerate your career.</p>
        <p>Get started by completing your profile and browsing the dashboard!</p>
        <br/>
        <p>Best regards,</p>
        <p>The YuvaHub Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully to:', email);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email to:', email, error);
    return null;
  }
});
