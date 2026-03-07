#!/usr/bin/env node

const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function migrate() {
  let connection;
  try {
    console.log("🚀 Starting database migration...");
    console.log("📍 DATABASE_URL:", process.env.DATABASE_URL ? "✓ Loaded" : "✗ Missing");
    console.log("📍 DB_HOST:", process.env.DB_HOST || "not set");

    // Parse DATABASE_URL
    let config;
    if (process.env.DATABASE_URL) {
      try {
        const dbUrl = new URL(process.env.DATABASE_URL);
        config = {
          host: dbUrl.hostname,
          user: dbUrl.username,
          password: dbUrl.password,
          database: dbUrl.pathname.slice(1),
          multipleStatements: true,
        };
        console.log("✓ Using DATABASE_URL");
      } catch (e) {
        throw new Error(`Invalid DATABASE_URL: ${e.message}`);
      }
    } else {
      // Fallback to individual env vars
      config = {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || "clusterconnect",
        multipleStatements: true,
      };
      console.log("✓ Using individual DB variables");
    }

    console.log(`🔗 Connecting to ${config.host}:3306/${config.database}...`);
    
    connection = await mysql.createConnection(config);
    console.log("✅ Connected to database");

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
