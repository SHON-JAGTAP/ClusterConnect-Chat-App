const { getMessagesBetweenUsers, getMessagesByRoom } = require("../models/messageModel");
const { getAllUsers, getUserById } = require("../models/userModel");
const redis = require("../config/redis");

/**
 * GET /api/chat/messages/:chatRoom
 * Fetch the conversation between the logged-in user and the target user.
 * Supports ?before= for cursor-based pagination.
 */
async function getMessages(req, res) {
  try {
    const { chatRoom } = req.params;
    const userId = req.user.userId;
    const { before, limit } = req.query;

    if (!chatRoom) {
      return res.status(400).json({ message: "chatRoom parameter is required" });
    }

    const messages = await getMessagesBetweenUsers(userId, chatRoom, {
      limit: Math.min(parseInt(limit) || 50, 100), // Cap at 100
      before,
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ getMessages error:", error.message);
    res.status(500).json({ message: "Failed to retrieve messages" });
  }
}

/**
 * POST /api/chat/send
 * Direct HTTP fallback for sending a message (normally goes through Socket via Kafka).
 * Only use when Socket/Kafka is unavailable.
 */
async function sendMessage(req, res) {
  try {
    const { message, chatRoom } = req.body;
    // Use authenticated sender from JWT, NOT from request body (security fix)
    const senderId = req.user.userId;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "message is required and must be a non-empty string" });
    }

    if (!chatRoom) {
      return res.status(400).json({ message: "chatRoom is required" });
    }

    const { createMessage } = require("../models/messageModel");
    const newMessage = await createMessage(senderId, message, chatRoom);

    // Fetch sender info for response enrichment
    const senderInfo = await getUserById(senderId);

    res.status(201).json({
      message: "Message sent",
      data: {
        ...newMessage,
        sender: senderInfo,
      },
    });
  } catch (error) {
    console.error("❌ sendMessage error:", error.message);
    res.status(500).json({ message: "Failed to send message" });
  }
}

/**
 * GET /api/chat/users
 * Fetch all registered users (excluding the caller's own account).
 */
async function getUsers(req, res) {
  try {
    const currentUserId = req.user.userId;
    const users = await getAllUsers();
    // Filter out the requesting user on the server side
    const filtered = users.filter(
      (u) => u._id.toString() !== currentUserId.toString()
    );

    // Fetch live online status from Redis for each user
    const annotatedUsers = await Promise.all(
      filtered.map(async (u) => {
        const isOnline = await redis.get(`online:${u._id.toString()}`);
        return {
          ...u,
          isOnline: !!isOnline,
        };
      })
    );

    res.status(200).json(annotatedUsers);
  } catch (error) {
    console.error("❌ getUsers error:", error.message);
    res.status(500).json({ message: "Failed to retrieve users" });
  }
}

module.exports = { getMessages, sendMessage, getUsers };
