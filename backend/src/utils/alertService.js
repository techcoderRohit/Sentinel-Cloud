const axios = require('axios');
const sendEmail = require('./sendEmail'); // Aapki purani file
const SendAlert = async (user, alertData) => {
    const { title, message } = alertData;

    try {
        // 1. Email Alert (Aapke existing function ko reuse kar rahe hain)
        if (user.email) {
            await sendEmail({
                email: user.email,
                subject: `🚨 Sentinel Alert: ${title}`,
                message: `Alert Details: ${message}`,
                alert: "ALERT" // Aapne template mein OTP manga hai, wahan Alert text dikhega
            });
        }

        // 2. Telegram Alert
        if (user.telegramChatId) {
            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
            await axios.post(url, {
                chat_id: user.telegramChatId,
                text: `🛑 *SENTINEL CLOUD ALERT*\n\n*Device:* ${title}\n*Issue:* ${message}`,
                parse_mode: 'Markdown'
            });
        }

        console.log("All notifications dispatched!");
    } catch (error) {
        console.error("Alert service error:", error.message);
    }
};

module.exports = SendAlert;