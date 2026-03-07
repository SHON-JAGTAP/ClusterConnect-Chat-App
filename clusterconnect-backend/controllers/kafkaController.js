const { producer } = require("../config/kafka");

let isKafkaConnected = false;

// Connect producer once at startup
async function initKafkaProducer() {
  try {
    await producer.connect();
    isKafkaConnected = true;
    console.log("✅ Kafka Producer Connected");
  } catch (error) {
    isKafkaConnected = false;
    console.warn("⚠️  Kafka Producer Connection Failed (non-critical):", error.message);
    console.log("💡 App will continue without Kafka");
  }
}

// Send message to Kafka topic
async function sendMessageToKafka(data) {
  if (!isKafkaConnected) {
    console.warn("⚠️  Kafka not available - message will not be queued");
    return;
  }

  try {
    await producer.send({
      topic: "chat-messages",
      messages: [
        {
          value: JSON.stringify(data),
        },
      ],
    });

    console.log("📤 Message sent to Kafka");
  } catch (error) {
    console.warn("⚠️  Kafka Send Error (non-critical):", error.message);
    // Don't crash - app continues anyway
  }
}

module.exports = {
  initKafkaProducer,
  sendMessageToKafka,
  isKafkaConnected: () => isKafkaConnected,
};
