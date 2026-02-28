const { producer } = require("../config/kafka");

// Connect producer once at startup
async function initKafkaProducer() {
  try {
    await producer.connect();
    console.log("✅ Kafka Producer Connected");
  } catch (error) {
    console.error("❌ Kafka Producer Connection Error:", error);
  }
}

// Send message to Kafka topic
async function sendMessageToKafka(data) {
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
    console.error("❌ Kafka Send Error:", error);
  }
}

module.exports = {
  initKafkaProducer,
  sendMessageToKafka,
};
