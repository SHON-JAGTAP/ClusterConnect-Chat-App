require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Test database connection
pool.on("connect", () => {
  console.log("✅ Database connected successfully");
});

pool.on("error", (err) => {
  console.error("❌ Database connection error:", err);
});

// Test query on startup
pool.query("SELECT NOW()", (err, result) => {
  if (err) {
    console.error("❌ Database query failed:", err);
  } else {
    console.log("✅ Database query successful:", result.rows[0]);
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// Socket.io connection
io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("join_room", (data) => {
    socket.join(data.chatRoom);
    console.log(`User ${data.userId} joined room ${data.chatRoom}`);
    io.to(data.chatRoom).emit("user_joined", data);
  });

  socket.on("send_message", (data) => {
    io.to(data.chatRoom).emit("receive_message", data);
  });

  socket.on("user_typing", (data) => {
    socket.to(data.chatRoom).emit("user_typing", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});
