const pool = require("../config/db");

async function createMessage(senderId, message, chatRoom = null) {
  const [result] = await pool.query(
    "INSERT INTO messages (sender_id, message, created_at) VALUES (?, ?, NOW())",
    [senderId, message]
  );
  const [rows] = await pool.query(
    "SELECT * FROM messages WHERE id = ?",
    [result.insertId]
  );
  return rows[0];
}

async function getMessagesByRoom(chatRoom) {
  const [rows] = await pool.query(
    `SELECT m.*, u.name, u.email 
     FROM messages m 
     JOIN users u ON m.sender_id = u.id 
     ORDER BY m.created_at ASC`
  );
  return rows;
}

async function getMessagesBetweenUsers(userId1, userId2) {
  const [rows] = await pool.query(
    `SELECT m.*, u.name, u.email 
     FROM messages m 
     JOIN users u ON m.sender_id = u.id 
     WHERE (m.sender_id = ? OR m.sender_id = ?) 
     ORDER BY m.created_at ASC`,
    [userId1, userId2]
  );
  return rows;
}

module.exports = { createMessage, getMessagesByRoom, getMessagesBetweenUsers };
