const { producer } = require("../config/kafka");

let isKafkaConnected = false;
let reconnectTimer = null;
const RECONNECT_DELAY_MS = 10000; // retry every 10 seconds

/**
 * Connect the Kafka producer with auto-retry on failure.
 * The app continues without Kafka if it is unavailable.
 */
async function initKafkaProducer() {
  try {
    await producer.connect();
    isKafkaConnected = true;
    clearTimeout(reconnectTimer); // Clear any pending retry
    console.log("✅ Kafka Producer Connected");

    // Handle unexpected disconnects
    producer.on(producer.events.DISCONNECT, () => {
      console.warn("⚠️  Kafka Producer disconnected unexpectedly. Scheduling reconnect...");
      isKafkaConnected = false;
      scheduleReconnect();
    });
  } catch (error) {
    isKafkaConnected = false;
    console.warn("⚠️  Kafka Producer Connection Failed (non-critical):", error.message);
    console.log(`💡 Retrying Kafka connection in ${RECONNECT_DELAY_MS / 1000}s...`);
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(() => {
    console.log("🔄 Retrying Kafka Producer connection...");
    initKafkaProducer();
  }, RECONNECT_DELAY_MS);
}

/**
 * Send a message to the Kafka topic.
 * Uses message key for deterministic partitioning by chatRoom.
 * @param {Object} data - { senderId, message, chatRoom }
 */
async function sendMessageToKafka(data) {
  if (!isKafkaConnected) {
    console.warn("⚠️  Kafka not available — message will not be queued:", data.chatRoom);
    return { queued: false, reason: "kafka_unavailable" };
  }

  if (!data.senderId || !data.message) {
    console.warn("⚠️  sendMessageToKafka: Missing required fields");
    return { queued: false, reason: "missing_fields" };
  }

  try {
    await producer.send({
      topic: "chat-messages",
      messages: [
        {
          // Use chatRoom as partition key → all messages in a room go to same partition, preserving order
          key: data.chatRoom ? data.chatRoom.toString() : data.senderId.toString(),
          value: JSON.stringify({
            senderId: data.senderId,
            message: data.message,
            chatRoom: data.chatRoom,
            timestamp: Date.now(),
          }),
        },
      ],
    });
    console.log(`📤 Kafka: Message queued [room=${data.chatRoom}]`);
    return { queued: true };
  } catch (error) {
    console.warn("⚠️  Kafka Send Error (non-critical):", error.message);
    return { queued: false, reason: error.message };
  }
}

module.exports = {
  initKafkaProducer,
  sendMessageToKafka,
  isKafkaConnected: () => isKafkaConnected,
};
