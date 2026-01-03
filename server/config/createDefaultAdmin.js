import pool from './database.js';
import { hashPassword } from '../utils/helpers.js';

const createDefaultAdmin = async () => {
  try {
    console.log('🔧 Creating default admin user...');

    const email = 'admin@setu.com';
    const password = 'admin123';
    const name = 'Super Admin';

    // Check if admin already exists
    const existingAdmin = await pool.query(
      'SELECT * FROM admins WHERE email = $1',
      [email]
    );

    if (existingAdmin.rows.length > 0) {
      console.log('ℹ️  Admin user already exists!');
      console.log('Email:', email);
      console.log('You can login with the existing credentials.');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin
    await pool.query(
      `INSERT INTO admins (name, email, password, is_super_admin, is_active)
       VALUES ($1, $2, $3, $4, $5)`,
      [name, email, hashedPassword, true, true]
    );

    console.log('✅ Default admin created successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('');
    console.log('⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
    process.exit(1);
  }
};

createDefaultAdmin();
