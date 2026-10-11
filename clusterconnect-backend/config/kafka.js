const { Kafka } = require("kafkajs");

const configuredBroker = process.env.KAFKA_BROKER || process.env.KAFKA_BROKERS || "kafka:9092";
const kafkaEnabled = process.env.KAFKA_ENABLED !== "false" && !(
  process.env.NODE_ENV === "production" && /^(localhost|127\.0\.0\.1)(:|$)/.test(configuredBroker)
);

if (!kafkaEnabled) {
  console.warn(`⚠️ Kafka disabled; configured broker is ${configuredBroker}`);
}

const kafka = new Kafka({
  clientId: "chat-app",
  brokers: [configuredBroker],

});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "chat-group" });

module.exports = { kafka, producer, consumer, kafkaEnabled };
