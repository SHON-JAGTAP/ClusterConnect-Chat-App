const { consumer } = require("./config/kafka");
const pool = require("./config/db");
const redis = require("./config/redis");

async function runConsumer() {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: "chat-messages", fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const data = JSON.parse(message.value.toString());

          console.log("📥 Kafka message received:", data);

          // Save to MySQL
          const [result] = await pool.query(
            "INSERT INTO messages (sender_id, message) VALUES (?, ?)",
            [data.senderId, data.message]
          );

          console.log("✅ Message saved to DB");

          // Publish to Redis for real-time broadcast
          await redis.publish("chat_channel", JSON.stringify({
            ...data,
            id: result.insertId,
            created_at: new Date()
          }));

          console.log("✅ Message published to Redis");
        } catch (innerErr) {
          console.error("❌ Error processing Kafka message:", innerErr.message);
        }
      },
    });
  } catch (err) {
    console.error("⚠️  Kafka Consumer Error (non-critical):", err.message);
    console.log("💡 Kafka is optional - app will continue without it");
  }
}

module.exports = runConsumer;
  