const Notification = require('../models/Notification');
const SendAlert = require('../utils/alertService');
const User = require('../models/User');

// =============================================
// DEFAULT THRESHOLDS (Configurable per-user later)
// =============================================
const THRESHOLDS = {
  temperature: {
    critical_high: 45,
    critical_low: 0,
    warning_high: 35,
    warning_low: 10
  },
  humidity: {
    critical_high: 95,
    critical_low: 10,
    warning_high: 85,
    warning_low: 20
  }
};

// =============================================
// COOLDOWN CACHE — Prevent alert spam
// Key format: `${ownerId}_${apiKeyId}_${anomalyType}`
// Value: timestamp of last alert
// =============================================
const alertCooldowns = new Map();
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

const isOnCooldown = (key) => {
  const lastAlert = alertCooldowns.get(key);
  if (!lastAlert) return false;
  return (Date.now() - lastAlert) < COOLDOWN_MS;
};

const setCooldown = (key) => {
  alertCooldowns.set(key, Date.now());
  // Clean old entries periodically
  if (alertCooldowns.size > 500) {
    const now = Date.now();
    for (const [k, v] of alertCooldowns) {
      if (now - v > COOLDOWN_MS * 2) alertCooldowns.delete(k);
    }
  }
};

/**
 * Check incoming sensor data for anomalies and dispatch alerts
 * @param {Object} payload - { temperature, humidity, status }
 * @param {String} deviceName - Human-readable device name
 * @param {Object} apiKeyDoc - The API Key document (has _id, owner)
 * @param {Object} io - Socket.io instance for real-time push
 */
const checkForAnomalies = async (payload, deviceName, apiKeyDoc, io) => {
  const { temperature, humidity } = payload;
  const ownerId = apiKeyDoc.owner;
  const apiKeyId = apiKeyDoc._id;
  const anomalies = [];

  // --- TEMPERATURE CHECKS ---
  if (temperature !== undefined && temperature !== null) {
    if (temperature >= THRESHOLDS.temperature.critical_high) {
      anomalies.push({
        type: 'critical',
        title: `🔥 Critical: High Temperature — ${deviceName}`,
        message: `Temperature has reached ${temperature}°C (threshold: ${THRESHOLDS.temperature.critical_high}°C). Immediate attention required!`,
        anomalyKey: `${ownerId}_${apiKeyId}_temp_critical_high`
      });
    } else if (temperature <= THRESHOLDS.temperature.critical_low) {
      anomalies.push({
        type: 'critical',
        title: `❄️ Critical: Low Temperature — ${deviceName}`,
        message: `Temperature has dropped to ${temperature}°C (threshold: ${THRESHOLDS.temperature.critical_low}°C). Possible sensor failure or freezing conditions.`,
        anomalyKey: `${ownerId}_${apiKeyId}_temp_critical_low`
      });
    } else if (temperature >= THRESHOLDS.temperature.warning_high) {
      anomalies.push({
        type: 'warning',
        title: `⚠️ Warning: High Temperature — ${deviceName}`,
        message: `Temperature is ${temperature}°C, approaching critical levels (threshold: ${THRESHOLDS.temperature.warning_high}°C).`,
        anomalyKey: `${ownerId}_${apiKeyId}_temp_warning_high`
      });
    } else if (temperature <= THRESHOLDS.temperature.warning_low) {
      anomalies.push({
        type: 'warning',
        title: `⚠️ Warning: Low Temperature — ${deviceName}`,
        message: `Temperature is ${temperature}°C, below normal range (threshold: ${THRESHOLDS.temperature.warning_low}°C).`,
        anomalyKey: `${ownerId}_${apiKeyId}_temp_warning_low`
      });
    }
  }

  // --- HUMIDITY CHECKS ---
  if (humidity !== undefined && humidity !== null) {
    if (humidity >= THRESHOLDS.humidity.critical_high) {
      anomalies.push({
        type: 'critical',
        title: `💧 Critical: High Humidity — ${deviceName}`,
        message: `Humidity has reached ${humidity}% (threshold: ${THRESHOLDS.humidity.critical_high}%). Risk of condensation or water damage.`,
        anomalyKey: `${ownerId}_${apiKeyId}_hum_critical_high`
      });
    } else if (humidity <= THRESHOLDS.humidity.critical_low) {
      anomalies.push({
        type: 'critical',
        title: `🏜️ Critical: Low Humidity — ${deviceName}`,
        message: `Humidity has dropped to ${humidity}% (threshold: ${THRESHOLDS.humidity.critical_low}%). Possible sensor malfunction.`,
        anomalyKey: `${ownerId}_${apiKeyId}_hum_critical_low`
      });
    } else if (humidity >= THRESHOLDS.humidity.warning_high) {
      anomalies.push({
        type: 'warning',
        title: `⚠️ Warning: High Humidity — ${deviceName}`,
        message: `Humidity is ${humidity}%, approaching critical levels (threshold: ${THRESHOLDS.humidity.warning_high}%).`,
        anomalyKey: `${ownerId}_${apiKeyId}_hum_warning_high`
      });
    } else if (humidity <= THRESHOLDS.humidity.warning_low) {
      anomalies.push({
        type: 'warning',
        title: `⚠️ Warning: Low Humidity — ${deviceName}`,
        message: `Humidity is ${humidity}%, below normal range (threshold: ${THRESHOLDS.humidity.warning_low}%).`,
        anomalyKey: `${ownerId}_${apiKeyId}_hum_warning_low`
      });
    }
  }

  // --- PROCESS DETECTED ANOMALIES ---
  for (const anomaly of anomalies) {
    // Check cooldown to avoid spam
    if (isOnCooldown(anomaly.anomalyKey)) {
      continue;
    }

    try {
      // 1. Save notification to DB
      const notification = await Notification.create({
        userId: ownerId,
        title: anomaly.title,
        message: anomaly.message,
        type: anomaly.type
      });

      // 2. Set cooldown
      setCooldown(anomaly.anomalyKey);

      // 3. Push real-time notification via Socket.io
      if (io) {
        io.emit('new_notification', {
          _id: notification._id,
          userId: ownerId.toString(),
          title: anomaly.title,
          message: anomaly.message,
          type: anomaly.type,
          isRead: false,
          createdAt: notification.createdAt
        });
      }

      // 4. Send external alerts (Telegram + Email) — fire and forget
      const user = await User.findById(ownerId).select('email telegramChatId');
      if (user) {
        SendAlert(user, { title: anomaly.title, message: anomaly.message }).catch(err => {
          console.error('[AnomalyDetector] External alert dispatch failed:', err.message);
        });
      }

      console.log(`[AnomalyDetector] ${anomaly.type.toUpperCase()} alert created for ${deviceName}: ${anomaly.message}`);

    } catch (err) {
      console.error('[AnomalyDetector] Failed to create notification:', err.message);
    }
  }

  return anomalies.length;
};

module.exports = { checkForAnomalies };
