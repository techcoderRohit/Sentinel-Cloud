const mqtt = require('mqtt');
const chalk = require('chalk');

// Connect to the local MQTT broker
const client = mqtt.connect('mqtt://127.0.0.1:1883');

const TOPIC_FILTER = 'sensors/#';
const TEMP_ALERT_THRESHOLD = 35.0; // Example threshold

client.on('connect', () => {
  console.log(chalk.green.bold('🛡️  Server Subscriber connected to local broker'));
  client.subscribe(TOPIC_FILTER, (err) => {
    if (!err) {
      console.log(chalk.cyan('📡 Subscribed to feeds:'), chalk.yellow(TOPIC_FILTER));
    }
  });
});

client.on('message', (topic, message) => {
  const payloadStr = message.toString();

  console.log(
    chalk.gray(`[${new Date().toLocaleTimeString()}]`),
    chalk.blue(`[FEED: ${topic}]`),
    chalk.white(payloadStr)
  );

  // Example Processing Logic: Alert on High Temperature
  if (topic === 'sensors/temperature') {
    const temp = parseFloat(payloadStr);
    if (!isNaN(temp) && temp > TEMP_ALERT_THRESHOLD) {
      console.log(
        chalk.red.bold('⚠️  ALERT: High Temperature Detected!'),
        chalk.red(`${temp}°C`)
      );
    }
  }

  // Example Processing Logic: Handle JSON data topic
  if (topic === 'sensors/data') {
    try {
      const data = JSON.parse(payloadStr);
      // You could save this to a database here (e.g., MongoDB, SQLite)
      // console.log(chalk.magenta('📊 Structured data received from:'), data.clientId);
    } catch (e) {
      // Not JSON
    }
  }
});

client.on('error', (err) => {
  console.error(chalk.red('❌ Subscriber Error:'), err);
});