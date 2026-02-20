require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const redis = require("./config/redis");
const pool = require("./config/db");

const { initKafkaProducer, sendMessageToKafka } = require("./controllers/kafkaController");
const runConsumer = require("./kafkaconsumer");

const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
const server = http.createServer(app);

// ==============================
// INIT KAFKA + CONSUMER
// ==============================

initKafkaProducer();
runConsumer();

// ==============================
// CORS
// ==============================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// ==============================
// ROUTES
// ==============================

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// ==============================
// DATABASE TEST
// ==============================

pool
  .query("SELECT NOW()")
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch((err) => console.error("❌ PostgreSQL Error:", err));

// ==============================
// SOCKET.IO
// ==============================

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// ==============================
// REDIS SUBSCRIBER (Broadcast Only)
// ==============================

const subscriber = redis.duplicate();
subscriber.subscribe("chat_channel");

subscriber.on("message", (channel, message) => {
  try {
    const data = JSON.parse(message);
    io.to(data.chatRoom).emit("receive_message", data);
  } catch (err) {
    console.error("Redis message error:", err);
  }
});

// ==============================
// SOCKET EVENTS
// ==============================

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("join_room", (data) => {
    socket.join(data.chatRoom);
  });

  socket.on("send_message", async (data) => {
    try {
      // Send to Kafka instead of Redis
      await sendMessageToKafka(data);
    } catch (err) {
      console.error("Kafka send error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ==============================
// START SERVER
// ==============================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
