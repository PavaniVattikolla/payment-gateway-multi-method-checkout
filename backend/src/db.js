const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

let isInitialized = false;

async function initializeDatabase() {
  if (isInitialized) return;
  
  try {
    // Wait for database to be ready
    let retries = 5;
    while (retries > 0) {
      try {
        const conn = await pool.connect();
        conn.release();
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Load and execute schema
    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    const statements = schema.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }
    
    console.log('Database initialized successfully');
    isInitialized = true;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database query error:', { text, error });
    throw error;
  }
}

module.exports = { pool, query, initializeDatabase };
