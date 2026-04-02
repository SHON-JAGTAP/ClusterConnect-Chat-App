require("dotenv").config();
const mongoose = require("mongoose");

// Define User Schema
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

// Define ChatRoom Schema
const chatRoomSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    description: String,
    created_by: String,
  },
  { timestamps: true }
);

// Define Message Schema
const messageSchema = new mongoose.Schema(
  {
    sender_id: String,
    recipient_id: String,
    content: String,
    chat_room: String,
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Define RoomMember Schema
const roomMemberSchema = new mongoose.Schema(
  {
    room_id: mongoose.Schema.Types.ObjectId,
    user_id: String,
    joined_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

const User = mongoose.model("User", userSchema);
const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);
const Message = mongoose.model("Message", messageSchema);
const RoomMember = mongoose.model("RoomMember", roomMemberSchema);

// Data from dump.sql
const usersData = [
  {
    _id: "4473c0e6-1193-11f1-b026-00155dc51da1",
    email: "jagtapshon10@gmail.com",
    name: "Shon Jagtap",
    password: null,
    avatar: null,
    status: "offline",
    createdAt: new Date("2026-02-24 15:12:43"),
    updatedAt: new Date("2026-02-24 15:12:43"),
  },
  {
    _id: "7528894d-119d-11f1-b026-00155dc51da1",
    email: "jagtapshon@gmail.com",
    name: "shonjagtap",
    password: "$2a$10$qSWmchGmAwCAtf2vQK.1s.KVG7/FMhja/VJkCSJ89kIi3BJODv4SS",
    avatar: null,
    status: "offline",
    createdAt: new Date("2026-02-24 16:25:39"),
    updatedAt: new Date("2026-02-24 16:25:39"),
  },
  {
    _id: "dda95e89-1193-11f1-b026-00155dc51da1",
    email: "sar@gmail.com",
    name: "sarthak",
    password: "$2a$10$kSfZk4T8N9DTuiiKUDQdyO6E.E7rizX9op0dTRNEjr63Py1R/wxLG",
    avatar: null,
    status: "offline",
    createdAt: new Date("2026-02-24 15:17:00"),
    updatedAt: new Date("2026-02-24 15:17:00"),
  },
];

async function migrateData() {
  try {
    console.log("🔗 Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ Connected!");

    // Clear existing data
    console.log("\n🗑️  Clearing existing collections...");
    await User.deleteMany({});
    await ChatRoom.deleteMany({});
    await Message.deleteMany({});
    await RoomMember.deleteMany({});

    // Insert users
    console.log("\n📥 Importing users...");
    const insertedUsers = await User.insertMany(usersData);
    console.log(`✅ Imported ${insertedUsers.length} users`);

    // Display imported users
    console.log("\n📋 Imported Users:");
    insertedUsers.forEach((user) => {
      console.log(`  - ${user.name} (${user.email})`);
    });

    console.log("\n✅ Migration Complete!");
    console.log("\n📊 Summary:");
    console.log(`  Users: ${await User.countDocuments()}`);
    console.log(`  ChatRooms: ${await ChatRoom.countDocuments()}`);
    console.log(`  Messages: ${await Message.countDocuments()}`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Migration Error:", err.message);
    process.exit(1);
  }
}

migrateData();
