const mqtt = require('mqtt');
const chalk = require('chalk');

const client = mqtt.connect('mqtt://127.0.0.1:1883');
const TOPIC = 'sensors/temperature';

client.on('connect', () => {
  console.log(chalk.green('✅ Test Client connected to broker'));
  
  // Simulate sending data every 3 seconds
  setInterval(() => {
    const temp = (Math.random() * 10 + 20).toFixed(2);
    const payload = JSON.stringify({
      temperature: temp,
      unit: 'Celsius',
      timestamp: new Date().toISOString()
    });
    
    console.log(chalk.blue('📤 Publishing:'), chalk.white(payload));
    client.publish(TOPIC, payload);
  }, 3000);
});

client.on('error', (err) => {
  console.error(chalk.red('❌ Test Client Error:'), err);
});