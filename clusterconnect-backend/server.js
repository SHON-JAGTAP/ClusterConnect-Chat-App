require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const redis = require("./config/redis");
const { connectDB } = require("./config/db");
const { getUserById } = require("./models/userModel");
const { initKafkaProducer, sendMessageToKafka } = require("./controllers/kafkaController");
const runConsumer = require("./kafkaconsumer");

const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");

// ─────────────────────────────────────────────
// APP INIT
// ─────────────────────────────────────────────

const app = express();
const server = http.createServer(app);

// ─────────────────────────────────────────────
// CORS CONFIG
// ─────────────────────────────────────────────

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean)
  .concat([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:42423",
  ]);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Pre-flight for all routes

// ─────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────

app.use(express.json({ limit: "10kb" })); // Limit request body size
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Basic security headers (lightweight alternative to helmet)
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// Health check (no auth required — for k8s liveness probes)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─────────────────────────────────────────────
// DATABASE + MESSAGE BROKER INIT
// ─────────────────────────────────────────────

(async () => {
  await connectDB();

  // Kafka is optional — app continues without it
  initKafkaProducer();
  runConsumer();
})();

// ─────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// ─────────────────────────────────────────────
// SOCKET.IO SETUP
// ─────────────────────────────────────────────

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  // Tune Socket.IO for production
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 10000,
  transports: ["websocket", "polling"], // Prefer WebSocket
});

// ─────────────────────────────────────────────
// SOCKET AUTH MIDDLEWARE
// ─────────────────────────────────────────────

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error: no token"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.userId) return next(new Error("Authentication error: invalid token payload"));

    socket.userId = decoded.userId;

    // Register session in Redis (TTL = 1 hour; auto-refreshed on reconnect)
    await redis.setex(`session:${decoded.userId}`, 3600, socket.id);
    next();
  } catch (err) {
    console.warn("🔐 Socket auth failed:", err.message);
    next(new Error("Authentication error"));
  }
});

// ─────────────────────────────────────────────
// REDIS SUBSCRIBER (pub/sub for cross-process broadcasting)
// ─────────────────────────────────────────────

const subscriber = redis.duplicate();

subscriber.on("ready", () => {
  subscriber.subscribe("chat_channel");
  console.log("✅ Redis Subscriber ready — subscribed to [chat_channel]");
});

subscriber.on("message", (channel, message) => {
  try {
    const data = JSON.parse(message);

    // Normalize sender ID to a plain string regardless of how it's stored
    const senderStr =
      data.sender_id?._id?.toString() ||
      data.sender_id?.toString() ||
      data.senderId?.toString();

    const chatRoomStr = data.chatRoom?.toString();

    // Broadcast to the chatRoom (the recipient's personal room)
    if (chatRoomStr) io.to(chatRoomStr).emit("receive_message", data);

    // Also echo back to sender (if different from target room)
    if (senderStr && senderStr !== chatRoomStr) {
      io.to(senderStr).emit("receive_message", data);
    }
  } catch (err) {
    console.error("❌ Redis subscriber message parse error:", err.message);
  }
});

subscriber.on("error", (err) => {
  console.error("❌ Redis subscriber error:", err.message);
});

// ─────────────────────────────────────────────
// SOCKET EVENTS
// ─────────────────────────────────────────────

io.on("connection", async (socket) => {
  const userId = socket.userId?.toString();
  console.log(`🔌 Socket connected [user=${userId} | id=${socket.id}]`);

  try {
    // Mark user as online with 1-hour TTL
    await redis.setex(`online:${userId}`, 3600, "true");
    
    // Broadcast the new user to everyone so their sidebar updates live
    const userObj = await getUserById(userId);
    if (userObj) {
      // Broadcast to EVERYONE connected (including self, frontend deduplicates)
      const userPayload = { 
        id: userObj._id.toString(), 
        email: userObj.email, 
        name: userObj.name,
        isOnline: true
      };
      
      io.emit("user_joined", userPayload); // For new registrations
      io.emit("user_online", { userId });  // For online status light
    }
  } catch (e) {
    console.warn("⚠️  Redis setex failed on connect:", e.message);
  }

  // Every user joins their own personal room for private message delivery
  socket.join(userId);

  // ── JOIN ROOM ──────────────────────────────
  socket.on("join_room", (data) => {
    if (!data?.chatRoom) return;
    socket.join(data.chatRoom.toString());
    console.log(`👥 User [${userId}] joined room [${data.chatRoom}]`);
  });

  // ── LEAVE ROOM ─────────────────────────────
  socket.on("leave_room", (data) => {
    if (!data?.chatRoom) return;
    socket.leave(data.chatRoom.toString());
    console.log(`🚪 User [${userId}] left room [${data.chatRoom}]`);
  });

  // ── SEND MESSAGE ───────────────────────────
  socket.on("send_message", async (data) => {
    if (!data?.message || !data?.chatRoom) {
      socket.emit("error", { message: "message and chatRoom are required" });
      return;
    }

    try {
      const result = await sendMessageToKafka({
        ...data,
        senderId: userId,         // Always use the authenticated socket userId
        message: data.message.trim(),
      });

      if (!result?.queued) {
        console.warn(`⚠️  Kafka unavailable — message not queued for room [${data.chatRoom}]`);
        // Optionally emit a 'message_failed' event so the UI can show a retry
        socket.emit("message_failed", { chatRoom: data.chatRoom });
      }
    } catch (err) {
      console.error("❌ send_message socket error:", err.message);
      socket.emit("error", { message: "Failed to send message. Please retry." });
    }
  });

  // ── TYPING INDICATORS ──────────────────────
  socket.on("typing_start", (data) => {
    if (!data?.chatRoom) return;
    socket.to(data.chatRoom.toString()).emit("user_typing", { userId });
  });

  socket.on("typing_stop", (data) => {
    if (!data?.chatRoom) return;
    socket.to(data.chatRoom.toString()).emit("user_stopped_typing", { userId });
  });

  // ── DISCONNECT ─────────────────────────────
  socket.on("disconnect", async (reason) => {
    console.log(`❌ Socket disconnected [user=${userId}] | reason: ${reason}`);
    try {
      await Promise.all([
        redis.del(`session:${userId}`),
        redis.del(`online:${userId}`),
      ]);
      io.emit("user_offline", { userId });
    } catch (e) {
      console.warn("⚠️  Redis cleanup failed on disconnect:", e.message);
    }
  });
});

// ─────────────────────────────────────────────
// ERROR HANDLING
// ─────────────────────────────────────────────

// 404 — must come after all routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  // CORS errors → expose origin in dev
  if (err.message?.startsWith("CORS")) {
    return res.status(403).json({ message: err.message });
  }

  console.error("❌ Unhandled Error:", err.stack || err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────

const PORT = parseInt(process.env.PORT || "5000", 10);

server.listen(PORT, () => {
  console.log(`🚀 ClusterConnect backend running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});

// Prevent crashes from unhandled async errors
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
  process.exit(1); // Fatal — let container orchestrator restart
});