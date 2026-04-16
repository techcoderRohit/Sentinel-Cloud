const aedes = require('aedes')();
const server = require('net').createServer(aedes.handle.bind(aedes));
const httpServer = require('http').createServer();
const ws = require('websocket-stream');
const chalk = require('chalk');

const MQTT_PORT = 1883;
const WS_PORT = 8888;

// MQTT over TCP
server.listen(MQTT_PORT, '0.0.0.0', function () {
  console.log(chalk.cyan.bold('\n🚀 MQTT Broker started and listening on port'), chalk.yellow(MQTT_PORT));
});

// MQTT over WebSockets
ws.createServer({ server: httpServer }, aedes.handle);

httpServer.listen(WS_PORT, function () {
  console.log(chalk.magenta.bold('🌐 WebSocket MQTT Broker started on port'), chalk.yellow(WS_PORT));
});

// --- Logging & Events ---

aedes.on('client', function (client) {
  console.log(chalk.green('✨ Client Connected:'), chalk.white(client ? client.id : 'unknown'));
});

aedes.on('clientDisconnect', function (client) {
  console.log(chalk.red('👋 Client Disconnected:'), chalk.white(client ? client.id : 'unknown'));
});

aedes.on('publish', function (packet, client) {
  if (client) {
    console.log(
      chalk.blue('📩 Message published by'),
      chalk.white(client.id),
      chalk.blue('on topic'),
      chalk.yellow(packet.topic),
      chalk.gray(':'),
      packet.payload.toString()
    );
  }
});

aedes.on('subscribe', function (subscriptions, client) {
  if (client) {
    console.log(
      chalk.yellow('🔔 Client'),
      chalk.white(client.id),
      chalk.yellow('subscribed to:'),
      subscriptions.map(s => s.topic).join(', ')
    );
  }
});

process.on('uncaughtException', (err) => {
  console.error(chalk.red('💥 Uncaught Exception:'), err);
});