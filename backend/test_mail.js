require('dotenv').config();
const nodemailer = require('nodemailer');

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASSWORD;

if (!user || !pass) {
  console.error('EMAIL_USER and EMAIL_PASSWORD must be configured in environment.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user, pass },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 10000,
});

transporter.verify((err, success) => {
  if (err) {
    console.error('Verify error:', err.message);
  } else {
    console.log('Transporter is ready:', success);
  }
});

transporter.sendMail({
  from: user,
  to: user,
  subject: 'BlockVault Live Test Delivery ' + new Date().toISOString(),
  text: 'Testing direct delivery to ' + user,
}, (err, info) => {
  if (err) {
    console.error('Send error:', err.message);
  } else {
    console.log('Delivery result:', {
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
      messageId: info.messageId,
    });
  }
});
