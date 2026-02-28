const pool = require("../config/db");
const bcrypt = require("bcryptjs");

async function findUserByEmail(email) {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  return rows[0];
}

async function createUser(email, name, password = null) {
  const [result] = await pool.query(
    "INSERT INTO users (email, name, password) VALUES (?, ?, ?)",
    [email, name, password]
  );
  const [rows] = await pool.query(
    "SELECT id, email, name, created_at FROM users WHERE id = ?",
    [result.insertId]
  );
  return rows[0];
}

async function getUserById(id) {
  const [rows] = await pool.query(
    "SELECT id, email, name, created_at FROM users WHERE id = ?",
    [id]
  );
  return rows[0];
}

async function getAllUsers() {
  const [rows] = await pool.query(
    "SELECT id, email, name, created_at FROM users"
  );
  return rows;
}

async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = { findUserByEmail, createUser, getUserById, getAllUsers, verifyPassword };
