// const axios = require('axios');
// const sendEmail = require('./sendEmail'); // Aapki purani file
// const SendAlert = async (user, alertData) => {
//     const { title, message } = alertData;

//     try {
//         // 1. Email Alert (Aapke existing function ko reuse kar rahe hain)
//         if (user.email) {
//             await sendEmail({
//                 email: user.email,
//                 subject: `🚨 Sentinel Alert: ${title}`,
//                 message: `Alert Details: ${message}`,
//                 alert: "ALERT" // Aapne template mein OTP manga hai, wahan Alert text dikhega
//             });
//         }

//         // 2. Telegram Alert
//         if (user.telegramChatId) {
//             const botToken = process.env.TELEGRAM_BOT_TOKEN;
//             const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
//             await axios.post(url, {
//                 chat_id: user.telegramChatId,
//                 text: `🛑 *SENTINEL CLOUD ALERT*\n\n*Device:* ${title}\n*Issue:* ${message}`,
//                 parse_mode: 'Markdown'
//             });
//         }

//         console.log("All notifications dispatched!");
//     } catch (error) {
//         console.error("Alert service error:", error.message);
//     }
// };

// module.exports = SendAlert;


const axios = require('axios');
const sendEmail = require('./sendEmail');

/**
 * Send alerts via all configured channels (Email + Telegram)
 * Designed to be plug-and-play — silently skips unconfigured channels
 * 
 * @param {Object} user - User object with { email, telegramChatId }
 * @param {Object} alertData - { title, message }
 */
const SendAlert = async (user, alertData) => {
    const { title, message } = alertData;

    // 1. Email Alert
    if (user.email && process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_email@gmail.com') {
        try {
            await sendEmail({
                email: user.email,
                subject: `🚨 Sentinel Alert: ${title}`,
                message: `Alert: ${message}`,
                html: `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; background: #0f172a;">
                        <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 20px 24px;">
                            <h2 style="color: white; margin: 0; font-size: 18px;">🚨 Sentinel Cloud Alert</h2>
                        </div>
                        <div style="padding: 24px;">
                            <h3 style="color: #f1f5f9; margin: 0 0 8px 0; font-size: 16px;">${title}</h3>
                            <p style="color: #94a3b8; margin: 0 0 20px 0; font-size: 14px; line-height: 1.6;">${message}</p>
                            <div style="background: #1e293b; border-radius: 8px; padding: 12px 16px;">
                                <p style="color: #64748b; margin: 0; font-size: 12px;">
                                    ⏰ Time: ${new Date().toLocaleString()}<br>
                                    📡 Platform: Sentinel Cloud IoT
                                </p>
                            </div>
                        </div>
                        <div style="border-top: 1px solid #1e293b; padding: 12px 24px; text-align: center;">
                            <p style="color: #475569; margin: 0; font-size: 11px;">Sentinel Cloud — Real-Time IoT Monitoring</p>
                        </div>
                    </div>
                `
            });
            console.log('[AlertService] Email alert sent to:', user.email);
        } catch (error) {
            console.error('[AlertService] Email alert failed:', error.message);
        }
    }

    // 2. Telegram Alert
    if (user.telegramChatId && process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN !== 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
        try {
            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
            await axios.post(url, {
                chat_id: user.telegramChatId,
                text: `🛑 *SENTINEL CLOUD ALERT*\n\n*${title}*\n\n📋 ${message}\n\n⏰ ${new Date().toLocaleString()}`,
                parse_mode: 'Markdown'
            });
            console.log('[AlertService] Telegram alert sent to chat:', user.telegramChatId);
        } catch (error) {
            console.error('[AlertService] Telegram alert failed:', error.message);
        }
    }
};

module.exports = SendAlert;