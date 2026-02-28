require("dotenv").config();
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initDatabase() {
  try {
    console.log(" Initializing database...");
    
    // Read SQL file
    const sqlPath = path.join(__dirname, "init.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");
    
    // Execute SQL
    await pool.query(sql);
    
    console.log("✅ Database tables created successfully!");
    
    // Check if tables exist
    const [rows] = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `);
    
    console.log("\n Tables in database:");
    rows.forEach(row => console.log(`  - ${row.table_name || row.TABLE_NAME}`));
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error(" Database initialization error:", error.message);
    process.exit(1);
  }
}

initDatabase();
