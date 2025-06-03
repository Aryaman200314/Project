const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aryaman2200314@gmail.com',     // Your Gmail
    pass: 'dkfi yity aboc flgh'             // App password (not account password)
  }
});

function sendEmail(to, subject, text) {
  const mailOptions = {
    from: 'aryaman2200314@gmail.com',
    to,
    subject,
    text
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('Email error:', err);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

module.exports = sendEmail;
