const pool = require("../config/db");
const bcrypt = require("bcryptjs");

async function findUserByEmail(email) {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0];
}

async function createUser(email, name, password = null) {
  const result = await pool.query(
    "INSERT INTO users (email, name, password) VALUES ($1, $2, $3) RETURNING id, email, name, created_at",
    [email, name, password]
  );
  return result.rows[0];
}

async function getUserById(id) {
  const result = await pool.query(
    "SELECT id, email, name, created_at FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0];
}

async function getAllUsers() {
  const result = await pool.query(
    "SELECT id, email, name, created_at FROM users"
  );
  return result.rows;
}

async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = { findUserByEmail, createUser, getUserById, getAllUsers, verifyPassword };
