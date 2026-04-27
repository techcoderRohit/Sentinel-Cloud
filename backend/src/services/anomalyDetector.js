const Notification = require('../models/Notification');
const SendAlert = require('../utils/alertService');
const User = require('../models/User');
const Trigger = require('../models/Trigger');

// =============================================
// DEFAULT THRESHOLDS (Fallback)
// =============================================
const DEFAULT_THRESHOLDS = {
  temperature: { high: 45, low: 0 },
  humidity: { high: 95, low: 10 }
};

const alertCooldowns = new Map();
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

const isOnCooldown = (key) => {
  const lastAlert = alertCooldowns.get(key);
  return lastAlert && (Date.now() - lastAlert) < COOLDOWN_MS;
};

const setCooldown = (key) => {
  alertCooldowns.set(key, Date.now());
};

/**
 * Check incoming sensor data for anomalies and dispatch alerts
 * Handles both hardcoded defaults and dynamic user-defined triggers
 */
const checkForAnomalies = async (payload, deviceName, deviceDoc, io) => {
  const ownerId = deviceDoc.owner;
  const deviceId = deviceDoc.deviceId;
  const anomalies = [];

  try {
    // 1. Fetch Custom User Triggers for this device
    const customTriggers = await Trigger.find({ 
      userId: ownerId, 
      deviceId: deviceId, 
      isActive: true 
    });

    // 2. Evaluate Custom Triggers
    for (const trigger of customTriggers) {
      const value = payload[trigger.feed];
      if (value === undefined || value === null) continue;

      let isTriggered = false;
      let conditionSymbol = '';

      switch (trigger.condition) {
        case 'greater_than':
          isTriggered = value > trigger.threshold;
          conditionSymbol = '>';
          break;
        case 'less_than':
          isTriggered = value < trigger.threshold;
          conditionSymbol = '<';
          break;
        case 'equal_to':
          isTriggered = value == trigger.threshold;
          conditionSymbol = '=';
          break;
      }

      if (isTriggered) {
        anomalies.push({
          type: trigger.alertType || 'warning',
          title: `🔔 Sentinel Alert: ${trigger.feed.toUpperCase()} — ${deviceName}`,
          message: `Your custom trigger was met: ${trigger.feed} (${value}) is ${conditionSymbol} ${trigger.threshold}.`,
          anomalyKey: `${ownerId}_${deviceId}_${trigger._id}`
        });
      }
    }

    // 3. Fallback: Default Critical Checks (If no custom triggers cover these)
    // Only check defaults if we haven't already flagged a custom trigger for this feed
    if (anomalies.length === 0) {
      if (payload.temperature >= DEFAULT_THRESHOLDS.temperature.high) {
        anomalies.push({
          type: 'critical',
          title: `🔥 High Temp — ${deviceName}`,
          message: `Critical temperature of ${payload.temperature}°C detected!`,
          anomalyKey: `${ownerId}_${deviceId}_temp_default_high`
        });
      }
    }

    // 4. Process detected anomalies
    for (const anomaly of anomalies) {
      if (isOnCooldown(anomaly.anomalyKey)) continue;

      // Save notification
      const notification = await Notification.create({
        userId: ownerId,
        title: anomaly.title,
        message: anomaly.message,
        type: anomaly.type
      });

      setCooldown(anomaly.anomalyKey);

      // Real-time Push
      if (io) {
        io.emit('new_notification', notification);
      }

      // External Alerts (Telegram/Email)
      const user = await User.findById(ownerId).select('email telegramChatId');
      if (user) {
        SendAlert(user, { title: anomaly.title, message: anomaly.message }).catch(e => 
          console.error('[AnomalyDetector] External alert error:', e.message)
        );
      }
    }

  } catch (err) {
    console.error('[AnomalyDetector] Processing Error:', err.message);
  }

  return anomalies.length;
};

module.exports = { checkForAnomalies };
