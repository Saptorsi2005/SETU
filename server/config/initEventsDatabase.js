import pool from '../config/database.js';

// Create database schema for events module
const createEventsTables = async () => {
  try {
    console.log('🔧 Creating events tables...');

    // Create events table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        image_url VARCHAR(500) DEFAULT '/default-event.jpg',
        organizer_user_id INTEGER,
        organizer_admin_id INTEGER,
        max_capacity INTEGER NOT NULL CHECK (max_capacity > 0),
        current_registrations INTEGER DEFAULT 0 CHECK (current_registrations >= 0),
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organizer_user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (organizer_admin_id) REFERENCES admins(id) ON DELETE SET NULL,
        CHECK (
          (organizer_user_id IS NOT NULL AND organizer_admin_id IS NULL) OR
          (organizer_user_id IS NULL AND organizer_admin_id IS NOT NULL)
        )
      );
    `);
    console.log('✅ Events table created');

    // Create event_registrations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS event_registrations (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        roll_number VARCHAR(100) NOT NULL,
        year INTEGER NOT NULL,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (event_id, student_id)
      );
    `);
    console.log('✅ Event registrations table created');

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
      CREATE INDEX IF NOT EXISTS idx_events_organizer_user ON events(organizer_user_id);
      CREATE INDEX IF NOT EXISTS idx_events_organizer_admin ON events(organizer_admin_id);
      CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);
      CREATE INDEX IF NOT EXISTS idx_event_registrations_student ON event_registrations(student_id);
    `);
    console.log('✅ Events indexes created');

    console.log('🎉 Events module database setup completed!');
  } catch (error) {
    console.error('❌ Error creating events tables:', error);
    throw error;
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createEventsTables()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default createEventsTables;
