const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'blockvault.support@gmail.com',
    pass: 'vwuwhbvaxwrcgpkh'
  }
});

transporter.verify((err, success) => {
  if (err) {
    console.error('Verify error:', err);
  } else {
    console.log('Transporter is ready:', success);
  }
});

transporter.sendMail({
  from: 'blockvault.support@gmail.com',
  to: 'blockvault.support@gmail.com',
  subject: 'BlockVault Live Test Delivery',
  text: 'Testing direct delivery to blockvault.support@gmail.com'
}, (err, info) => {
  if (err) {
    console.error('Send error:', err);
  } else {
    console.log('Delivery result:', {
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
      messageId: info.messageId
    });
  }
});
