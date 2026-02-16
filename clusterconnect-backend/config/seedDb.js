const pool = require('./db');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('✅ Database tables created successfully');
    
    // Test a simple query
    const result = await pool.query('SELECT tablename FROM pg_tables WHERE schemaname = $1', ['public']);
    console.log('📋 Tables in database:', result.rows.map(r => r.tablename));
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
