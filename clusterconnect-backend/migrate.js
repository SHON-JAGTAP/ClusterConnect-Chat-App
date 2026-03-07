#!/usr/bin/env node

const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function migrate() {
  let connection;
  try {
    console.log("🚀 Starting database migration...");

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || "clusterconnect",
      multipleStatements: true,
    });

    const dumpPath = path.join(__dirname, "../dump.sql");
    
    if (!fs.existsSync(dumpPath)) {
      console.log("⚠️  dump.sql not found, skipping migration");
      return;
    }

    const dump = fs.readFileSync(dumpPath, "utf8");
    
    console.log("📦 Executing database dump...");
    await connection.query(dump);
    
    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration error:", error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

migrate();
