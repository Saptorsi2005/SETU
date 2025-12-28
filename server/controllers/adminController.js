import pool from '../config/database.js';
import { hashPassword, comparePassword, sanitizeUser, isValidEmail, isStrongPassword } from '../utils/helpers.js';
import { generateToken } from '../utils/jwt.js';

// Admin login
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    // Find admin
    const result = await pool.query(
      'SELECT * FROM admins WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const admin = result.rows[0];

    // Check if admin is active
    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate token
    const token = generateToken({
      id: admin.id,
      email: admin.email,
      role: 'admin',
    });

    // Remove password from response
    const adminResponse = sanitizeUser(admin);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'Admin login successful!',
      data: {
        admin: adminResponse,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create admin (only super admin can do this)
export const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, is_super_admin } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, and password.',
      });
    }

    // Validate email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    // Validate password
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check if admin already exists
    const existingAdmin = await pool.query(
      'SELECT * FROM admins WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingAdmin.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'An admin with this email already exists.',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new admin
    const result = await pool.query(
      `INSERT INTO admins (name, email, password, is_super_admin)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email.toLowerCase(), hashedPassword, is_super_admin || false]
    );

    const admin = result.rows[0];
    const adminResponse = sanitizeUser(admin);

    res.status(201).json({
      success: true,
      message: 'Admin created successfully!',
      data: {
        admin: adminResponse,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get admin profile
export const getAdminProfile = async (req, res, next) => {
  try {
    const adminId = req.user.id;

    const result = await pool.query(
      'SELECT * FROM admins WHERE id = $1',
      [adminId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found.',
      });
    }

    const admin = sanitizeUser(result.rows[0]);

    res.status(200).json({
      success: true,
      data: {
        admin,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;

    let query = 'SELECT * FROM users';
    const values = [];
    let paramCount = 1;

    if (role && (role === 'student' || role === 'alumni')) {
      query += ` WHERE role = $${paramCount++}`;
      values.push(role);
    }

    query += ' ORDER BY created_at DESC';
    
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    const users = result.rows.map(user => sanitizeUser(user));

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM users';
    const countValues = [];
    if (role && (role === 'student' || role === 'alumni')) {
      countQuery += ' WHERE role = $1';
      countValues.push(role);
    }
    const countResult = await pool.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].count);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
