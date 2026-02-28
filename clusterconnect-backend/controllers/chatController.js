const { createMessage, getMessagesByRoom, getMessagesBetweenUsers } = require("../models/messageModel");
const { getAllUsers, getUserById } = require("../models/userModel");

async function getMessages(req, res) {
  try {
    const { chatRoom } = req.params;

    const messages = await getMessagesByRoom(chatRoom);
    res.status(200).json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: error.message });
  }
}

async function sendMessage(req, res) {
  try {
    const { senderId, message, chatRoom } = req.body;

    console.log("📨 Send message request:", { senderId, message, chatRoom });

    if (!senderId || !message) {
      return res.status(400).json({ message: "senderId and message are required" });
    }

    const newMessage = await createMessage(senderId, message, chatRoom);
    console.log("✅ Message created:", newMessage);

    const senderInfo = await getUserById(senderId);
    console.log("✅ Sender info:", senderInfo);

    res.status(201).json({
      message: "Message sent successfully",
      data: {
        ...newMessage,
        sender: senderInfo,
      },
    });
  } catch (error) {
    console.error("❌ Send message error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: error.message });
  }
}

async function getUsers(req, res) {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: error.message });
  }
}

module.exports = { getMessages, sendMessage, getUsers };
