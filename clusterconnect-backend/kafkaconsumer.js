const { consumer } = require("./config/kafka");
const pool = require("./config/db");
const redis = require("./config/redis");

async function runConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: "chat-messages", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
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
    },
  });
}

module.exports = runConsumer;
