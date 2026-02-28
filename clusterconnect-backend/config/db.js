require("dotenv").config();
const mysql = require("mysql2/promise");

console.log("🔍 DATABASE_URL:", process.env.DATABASE_URL ? "Loaded" : "Missing");

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(connection => {
    console.log(" MySQL Connected Successfully");
    return connection.query('SELECT NOW() as now');
  })
  .then(([rows]) => {
    console.log(" Database time:", rows[0].now);
  })
  .catch(err => {
    console.error(" MySQL Connection Error:", err.message);
  });

module.exports = pool;
