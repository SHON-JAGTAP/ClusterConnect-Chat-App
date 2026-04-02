const { mongoose } = require("../config/db");

const messageSchema = new mongoose.Schema(
  {
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender ID is required"],
      index: true,  // index for faster queries by sender
    },
    message: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    chatRoom: {
      type: String,
      default: null,
      index: true,  // index for faster room-based queries
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    messageType: {
      type: String,
      enum: ["text", "system"],
      default: "text",
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
  }
);

// Compound index for the most common query: messages between two users
messageSchema.index({ chatRoom: 1, createdAt: 1 });
messageSchema.index({ sender_id: 1, chatRoom: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);

/**
 * Create and persist a new message document.
 */
async function createMessage(senderId, message, chatRoom = null) {
  const newMessage = await Message.create({
    sender_id: senderId,
    message: message.trim(),
    chatRoom,
  });
  return newMessage.toObject();
}

/**
 * Fetch all messages in a specific chat room, sorted oldest-first.
 * Supports pagination via `limit` and `before` (cursor-based).
 */
async function getMessagesByRoom(chatRoom, { limit = 50, before } = {}) {
  const query = { chatRoom };
  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }
  return await Message.find(query)
    .populate("sender_id", "name email avatar")
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();
}

/**
 * Fetch DM conversation between two users, newest-first for pagination.
 * Queries both directions: user1→user2 and user2→user1.
 */
async function getMessagesBetweenUsers(userId1, userId2, { limit = 50, before } = {}) {
  const query = {
    $or: [
      { sender_id: userId1, chatRoom: userId2 },
      { sender_id: userId2, chatRoom: userId1 },
    ],
  };
  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }
  return await Message.find(query)
    .populate("sender_id", "name email avatar")
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();
}

/**
 * Mark messages in a chatRoom as read for a recipient.
 */
async function markMessagesAsRead(chatRoom, recipientId) {
  return await Message.updateMany(
    { chatRoom: recipientId.toString(), sender_id: { $ne: recipientId }, isRead: false },
    { $set: { isRead: true } }
  );
}

module.exports = {
  Message,
  createMessage,
  getMessagesByRoom,
  getMessagesBetweenUsers,
  markMessagesAsRead,
};
