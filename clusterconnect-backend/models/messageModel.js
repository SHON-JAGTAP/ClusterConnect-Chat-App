const pool = require("../config/db");

async function createMessage(senderId, message, chatRoom = null) {
  const result = await pool.query(
    "INSERT INTO messages (sender_id, message, created_at) VALUES ($1, $2, now()) RETURNING *",
    [senderId, message]
  );
  return result.rows[0];
}

async function getMessagesByRoom(chatRoom) {
  const result = await pool.query(
    `SELECT m.*, u.name, u.email 
     FROM messages m 
     JOIN users u ON m.sender_id = u.id 
     ORDER BY m.created_at ASC`
  );
  return result.rows;
}

async function getMessagesBetweenUsers(userId1, userId2) {
  const result = await pool.query(
    `SELECT m.*, u.name, u.email 
     FROM messages m 
     JOIN users u ON m.sender_id = u.id 
     WHERE (m.sender_id = $1 OR m.sender_id = $2) 
     ORDER BY m.created_at ASC`,
    [userId1, userId2]
  );
  return result.rows;
}

module.exports = { createMessage, getMessagesByRoom, getMessagesBetweenUsers };
