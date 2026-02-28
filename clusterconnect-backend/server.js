require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const redis = require("./config/redis");
const pool = require("./config/db");

const { initKafkaProducer, sendMessageToKafka } = require("./controllers/kafkaController");
const runConsumer = require("./kafkaconsumer");

const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
const server = http.createServer(app);


// ALLOWED ORIGINS


const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];


// CORS (Express)


app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());


// INIT KAFKA + CONSUMER


initKafkaProducer();
runConsumer();


// ROUTES


app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);


// DATABASE TEST


console.log("🔍 Testing MySQL connection...");
pool
  .query("SELECT NOW() as now")
  .then(([rows]) => {
    console.log("✅ MySQL Connected - Current time:", rows[0].now);
  })
  .catch((err) => {
    console.error("❌ MySQL Error:", err.message);
  });


// SOCKET.IO WITH CORS


const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});


// SOCKET AUTH MIDDLEWARE


io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;

    await redis.setex(`session:${decoded.userId}`, 3600, socket.id);

    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});


// REDIS SUBSCRIBER


const subscriber = redis.duplicate();
subscriber.subscribe("chat_channel");

subscriber.on("message", (channel, message) => {
  try {
    const data = JSON.parse(message);
    io.emit("receive_message", data);
  } catch (err) {
    console.error("Redis message error:", err);
  }
});


// SOCKET EVENTS

io.on("connection", async (socket) => {
  console.log("🔌 User connected:", socket.userId, socket.id);

  await redis.setex(`online:${socket.userId}`, 3600, "true");

  socket.on("join_room", (data) => {
    socket.join(data.chatRoom);
    console.log(`User ${socket.userId} joined room ${data.chatRoom}`);
  });

  socket.on("send_message", async (data) => {
    try {
      console.log("📤 Socket message received:", data);
      await sendMessageToKafka({
        ...data,
        senderId: socket.userId,
      });
    } catch (err) {
      console.error("Kafka send error:", err);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("disconnect", async () => {
    console.log("❌ User disconnected:", socket.userId);
    await redis.del(`session:${socket.userId}`);
    await redis.del(`online:${socket.userId}`);
  });
});


// START SERVER

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});