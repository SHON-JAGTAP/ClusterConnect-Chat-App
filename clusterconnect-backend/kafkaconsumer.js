const { consumer } = require("./config/kafka");
const redis = require("./config/redis");
const { createMessage } = require("./models/messageModel");

const KAFKA_TOPIC = "chat-messages";
const CONSUMER_RESTART_DELAY_MS = 15000;

async function runConsumer() {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: KAFKA_TOPIC, fromBeginning: false });

    console.log(`✅ Kafka Consumer connected and subscribed to [${KAFKA_TOPIC}]`);

    await consumer.run({
      // Process up to 5 messages concurrently within a batch for throughput
      partitionsConsumedConcurrently: 3,

      eachMessage: async ({ topic, partition, message }) => {
        const rawValue = message.value?.toString();
        if (!rawValue) {
          console.warn(`⚠️  Kafka: Received empty message on partition=${partition}`);
          return;
        }

        let data;
        try {
          data = JSON.parse(rawValue);
        } catch (parseErr) {
          console.error("❌ Kafka: Failed to parse message JSON:", parseErr.message, "| raw:", rawValue);
          // Don't rethrow — skip malformed messages so we don't block the partition
          return;
        }

        const { senderId, message: text, chatRoom } = data;

        if (!senderId || !text) {
          console.warn("⚠️  Kafka: Skipping message with missing senderId or text:", data);
          return;
        }

        let savedMessage;
        try {
          savedMessage = await createMessage(senderId, text, chatRoom);
          console.log(`✅ Kafka→MongoDB: Message saved [room=${chatRoom}]`);
        } catch (dbErr) {
          console.error("❌ Kafka→MongoDB: Failed to save message:", dbErr.message);
          // Rethrow so Kafka retries — this is a transient DB error
          throw dbErr;
        }

        try {
          const payload = JSON.stringify({
            ...savedMessage,
            // Normalize: ensure frontend-friendly sender_id field is populated
            sender_id: savedMessage.sender_id,
          });
          await redis.publish("chat_channel", payload);
          console.log(`✅ Kafka→Redis: Broadcast dispatched [room=${chatRoom}]`);
        } catch (redisErr) {
          // Redis publish failure should NOT rethrow — message is already persisted
          console.error("❌ Kafka→Redis: publish failed (message already saved):", redisErr.message);
        }
      },
    });
  } catch (err) {
    const isFatal = err.type === "REBALANCING"; // KafkaJS rebalance — can always retry
    console.error(`⚠️  Kafka Consumer Error (${isFatal ? "rebalancing" : "non-critical"}):`, err.message);
    console.log(`💡 Kafka is optional — retrying in ${CONSUMER_RESTART_DELAY_MS / 1000}s...`);

    setTimeout(() => {
      console.log("🔄 Restarting Kafka Consumer...");
      runConsumer();
    }, CONSUMER_RESTART_DELAY_MS);
  }
}

module.exports = runConsumer;