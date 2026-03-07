const pool = require("./config/db");
const fs = require("fs");
const path = require("path");

async function dumpDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Get database name from connection
    const [[result]] = await connection.query("SELECT DATABASE() as db_name");
    const dbName = result.db_name;
    
    console.log(`📦 Dumping database: ${dbName}...`);

    // Get all tables
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`,
      [dbName]
    );

    let dumpContent = `-- SQL Database Dump for ${dbName}\n`;
    dumpContent += `-- Generated on ${new Date().toISOString()}\n`;
    dumpContent += `-- Server version: MySQL\n\n`;
    dumpContent += `SET NAMES utf8mb4;\n`;
    dumpContent += `SET FOREIGN_KEY_CHECKS=0;\n\n`;
    dumpContent += `USE ${dbName};\n\n`;

    // Dump each table
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      console.log(`  ✓ Dumping table: ${tableName}`);

      // Get CREATE TABLE statement
      const [[createTableResult]] = await connection.query(
        `SHOW CREATE TABLE ${tableName}`
      );
      dumpContent += `\n-- --------------------------------------------------------\n`;
      dumpContent += `-- Table structure for table '${tableName}'\n`;
      dumpContent += `-- --------------------------------------------------------\n\n`;
      dumpContent += `DROP TABLE IF EXISTS ${tableName};\n`;
      dumpContent += createTableResult["Create Table"] + ";\n\n";

      // Get table data
      const [rows] = await connection.query(`SELECT * FROM ${tableName}`);
      if (rows.length > 0) {
        const columns = Object.keys(rows[0]);
        dumpContent += `-- --------------------------------------------------------\n`;
        dumpContent += `-- Dumping data for table '${tableName}' (${rows.length} record(s))\n`;
        dumpContent += `-- --------------------------------------------------------\n\n`;
        
        for (const row of rows) {
          const values = columns
            .map((col) => {
              const val = row[col];
              if (val === null) return "NULL";
              if (typeof val === "string") {
                return `'${val.replace(/'/g, "''")}'`;
              }
              if (val instanceof Date) {
                return `'${val.toISOString().slice(0, 19).replace("T", " ")}'`;
              }
              if (typeof val === "number") {
                return val;
              }
              return `'${val}'`;
            })
            .join(", ");
          dumpContent += `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${values});\n`;
        }
        dumpContent += "\n";
      }
    }
    
    dumpContent += `SET FOREIGN_KEY_CHECKS=1;\n`;

    // Write to file
    const dumpPath = path.join(__dirname, "../dump.sql");
    fs.writeFileSync(dumpPath, dumpContent);
    console.log(`\n✅ Database dump completed successfully!`);
    console.log(`📁 Saved to: ${dumpPath}`);
    console.log(`📊 Total tables dumped: ${tables.length}`);
    
  } catch (error) {
    console.error("❌ Error dumping database:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
    await pool.end();
  }
}

dumpDatabase();
