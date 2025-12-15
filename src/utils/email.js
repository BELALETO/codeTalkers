const nodemailer = require('nodemailer');
const { sendGridApiKey, senderEmail } = require('../config/config');

const transporter = nodemailer.createTransport({
  service: 'SendGrid',
  auth: {
    user: 'apikey',
    pass: sendGridApiKey
  }
});

const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: `"CodeTalkers" <${senderEmail}>`,
    to,
    subject,
    text,
    html: html || `<p>${text}</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully✅');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail;
