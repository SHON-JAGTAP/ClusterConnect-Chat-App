require("dotenv").config();
const mongoose = require("mongoose");

// User Schema
const userSchema = new mongoose.Schema(
  {
    _id: String,
    email: { type: String, unique: true },
    name: String,
    password: String,
    avatar: String,
    status: { type: String, default: "offline" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

// Your 3 users from dump.sql
const usersData = [
  {
    _id: "4473c0e6-1193-11f1-b026-00155dc51da1",
    email: "jagtapshon10@gmail.com",
    name: "Shon Jagtap",
    password: null,
    avatar: null,
    status: "offline",
  },
  {
    _id: "7528894d-119d-11f1-b026-00155dc51da1",
    email: "jagtapshon@gmail.com",
    name: "shonjagtap",
    password: "$2a$10$qSWmchGmAwCAtf2vQK.1s.KVG7/FMhja/VJkCSJ89kIi3BJODv4SS",
    avatar: null,
    status: "offline",
  },
  {
    _id: "dda95e89-1193-11f1-b026-00155dc51da1",
    email: "sar@gmail.com",
    name: "sarthak",
    password: "$2a$10$kSfZk4T8N9DTuiiKUDQdyO6E.E7rizX9op0dTRNEjr63Py1R/wxLG",
    avatar: null,
    status: "offline",
  },
];

async function seedData() {
  try {
    console.log("🔗 Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ Connected to MongoDB!");

    // Check if users already exist
    const existingCount = await User.countDocuments();
    if (existingCount > 0) {
      console.log(`\n⚠️  Database already has ${existingCount} users. Skipping seed.\n`);
      process.exit(0);
    }

    // Insert users
    console.log("\n📥 Creating collections and importing users...");
    await User.insertMany(usersData);
    console.log("✅ Users imported successfully!\n");

    // Display summary
    const count = await User.countDocuments();
    console.log("📋 Users in MongoDB Atlas:");
    const users = await User.find().select("email name");
    users.forEach((user) => {
      console.log(`  ✓ ${user.name} (${user.email})`);
    });

    console.log(`\n✅ Total: ${count} users`);
    console.log("\n🎉 Ready to use! Start your app with: npm run dev\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

seedData();
