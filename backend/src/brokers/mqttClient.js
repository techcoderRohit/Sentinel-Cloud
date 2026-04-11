const mqtt = require("mqtt");

const Sensor = require("../models/SensorData");

const client = mqtt.connect(
 "mqtt://broker.hivemq.com"
);

client.on("connect", () => {

 console.log("MQTT connected");

 client.subscribe(
  "iot/device1/sensor/data"
 );

});

client.on("message", async (topic, message) => {

 const data = JSON.parse(
  message.toString()
 );

 console.log("Received:", data);

 await Sensor.create({

  deviceId: "device1",

  temperature: data.temperature,

  humidity: data.humidity

 });

});


const sendCommand = (command) => {

 client.publish(

  "iot/device1/control",

  command

 );

};

module.exports = sendCommand;