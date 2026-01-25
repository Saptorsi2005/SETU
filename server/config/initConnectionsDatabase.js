import pool from './database.js';

/**
 * Initialize Mentor Connections Database Schema
 * Creates table for storing user-mentor connections
 */

export const initConnectionsDatabase = async () => {
  const client = await pool.connect();

  try {
    console.log('🔄 Initializing mentor connections database schema...');

    // Create mentor_connections table
    await client.query(`
      CREATE TABLE IF NOT EXISTS mentor_connections (
        connection_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        user_role VARCHAR(20) NOT NULL CHECK (user_role IN ('student', 'alumni')),
        mentor_name VARCHAR(255) NOT NULL,
        mentor_skill VARCHAR(500),
        mentor_avatar TEXT,
        match_score INTEGER,
        mentor_identifier VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, mentor_name)
      );
    `);
    console.log('✅ Mentor connections table created/verified');

    // Create indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_connections_user_id 
      ON mentor_connections(user_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_connections_user_role 
      ON mentor_connections(user_role);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_connections_created_at 
      ON mentor_connections(created_at DESC);
    `);

    console.log('✅ Indexes created/verified');

    console.log('✅ Mentor connections database initialization complete!');
  } catch (error) {
    console.error('❌ Error initializing mentor connections database:', error);
    throw error;
  } finally {
    client.release();
  }
};

export default initConnectionsDatabase;
