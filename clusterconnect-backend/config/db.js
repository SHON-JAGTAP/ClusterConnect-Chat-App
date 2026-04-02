require("dotenv").config();
const mongoose = require("mongoose");

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  console.error("❌ FATAL: MONGODB_URL environment variable is not set.");
  process.exit(1);
}

const mongooseOptions = {
  serverSelectionTimeoutMS: 5000,   // Fail fast if Mongo is unreachable
  socketTimeoutMS: 45000,           // Close sockets after 45s of inactivity
  maxPoolSize: 20,                  // Max connections in the pool
  minPoolSize: 5,                   // Keep at least 5 connections alive
  heartbeatFrequencyMS: 10000,      // Check server health every 10s
};

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URL, mongooseOptions);
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

// Handle connection events for visibility
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected. Attempting to reconnect...");
});

mongoose.connection.on("reconnected", () => {
  console.log("✅ MongoDB reconnected.");
});

// Graceful shutdown: close MongoDB on SIGINT/SIGTERM
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 ${signal} received. Closing MongoDB connection...`);
  await mongoose.connection.close();
  console.log("MongoDB connection closed.");
  process.exit(0);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

module.exports = { connectDB, mongoose };
