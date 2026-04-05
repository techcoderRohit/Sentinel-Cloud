const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1. Transporter banayein
  const transporter = nodemailer.createTransport({
    service: "gmail", 
    auth: {
      user: process.env.EMAIL_USER, // Aapka Gmail
      pass: process.env.EMAIL_PASS, // Aapka Gmail "App Password"
    },
  });
// 2. Email details (OTP ke liye dynamic message)
  const mailOptions = {
    from: '"Sentinel Cloud Support" <no-reply@sentinelcloud.com>',
    to: options.email,
    subject: options.subject,
    text: options.message, // Plain text version
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="color: #0891b2; text-align: center;">Sentinel Cloud</h2>
        <p style="font-size: 16px; color: #333;">Aapka Password Reset OTP niche diya gaya hai:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0891b2; background: #e0f2fe; padding: 10px 20px; border-radius: 5px;">
            ${options.otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #666; text-align: center;">Ye OTP <b>5 minute</b> tak valid hai. Kisi ke saath share na karein.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">Sentinel Cloud IoT Platform Project</p>
      </div>
    `,
  };

  // 3. Send Email
  await transporter.sendMail(mailOptions);
};


module.exports = sendEmail;