const { consumer } = require("./config/kafka");
const pool = require("./config/db");

async function runConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: "chat-messages", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value.toString());

      await pool.query(
        "INSERT INTO messages (sender_id, message) VALUES ($1, $2)",
        [data.sender, data.message]
      );

      console.log("Message saved to DB");
    },
  });
}

module.exports = runConsumer;
