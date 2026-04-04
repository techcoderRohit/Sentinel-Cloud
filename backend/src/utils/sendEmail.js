const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1. Transporter banayein
  const transporter = nodemailer.createTransport({
    service: "Gmail", 
    auth: {
      user: process.env.EMAIL_USER, // Aapka Gmail
      pass: process.env.EMAIL_PASS, // Aapka Gmail "App Password"
    },
  });

  // 2. Email options define karein
  const mailOptions = {
    from: `"Sentinel Cloud Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html, // Agar design wala email bhejna ho
  };

  // 3. Email bhein
  await transporter.sendTransport(mailOptions);
};

module.exports = sendEmail;