require("dotenv").config();
const mongoose = require("mongoose");

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ MongoDB Connected Successfully!");
    console.log("Database:", process.env.MONGODB_URL.split("/").pop());
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("❌ Connection Error:", err.message);
    process.exit(1);
  }
}

testConnection();
