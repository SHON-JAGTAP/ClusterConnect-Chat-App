const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "chat-app",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "chat-group" });

module.exports = { kafka, producer, consumer };
