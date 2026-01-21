import pool from '../config/database.js';
import { hashPassword, comparePassword, sanitizeUser, isValidEmail, isStrongPassword } from '../utils/helpers.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';
import { uploadDocumentToCloudinary } from '../config/cloudinary.js';

// Register a new user (student or alumni)
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, college, batch_year, department } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role || !college) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, role, and college.',
      });
    }

    // Validate role
    if (role !== 'student' && role !== 'alumni') {
      return res.status(400).json({
        success: false,
        message: 'Role must be either "student" or "alumni".',
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

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, college, batch_year, department)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, email.toLowerCase(), hashedPassword, role, college, batch_year || null, department || null]
    );

    const user = result.rows[0];

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Normalize user data to match app expectations
    const userResponse = {
      ...sanitizeUser(user),
      user_id: user.id, // Normalize ID field
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Alumni signup with document upload (separate from general register)
export const alumniSignup = async (req, res, next) => {
  try {
    const { name, email, password, college, batch_year, current_company, current_position } = req.body;

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

    const lowerEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [lowerEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    // Handle document upload
    let documentUrl = null;
    if (req.file) {
      try {
        documentUrl = await uploadDocumentToCloudinary(
          req.file.buffer,
          req.file.mimetype,
          'setu/alumni_docs'
        );
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload verification document. Please try again.',
        });
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new alumni user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, college, batch_year, current_company, current_position, verification_document)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        name,
        lowerEmail,
        hashedPassword,
        'alumni',
        college || 'Academy of Technology',
        batch_year || null,
        current_company || null,
        current_position || null,
        documentUrl
      ]
    );

    const user = result.rows[0];

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Normalize user data to match app expectations
    const userResponse = {
      ...sanitizeUser(user),
      user_id: user.id,
    };

    res.status(201).json({
      success: true,
      message: 'Alumni account created successfully!',
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    console.error('Error creating alumni account:', error);
    next(error);
  }
};

// Login user (student or alumni)
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Normalize user data to match app expectations
    const userResponse = {
      ...sanitizeUser(user),
      user_id: user.id, // Normalize ID field
    };

    // Set cookie (optional, for browser-based auth)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Logout user
export const logout = async (req, res, next) => {
  try {
    // Clear cookie
    res.clearCookie('token');

    res.status(200).json({
      success: true,
      message: 'Logout successful!',
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const user = sanitizeUser(result.rows[0]);

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      name,
      college,
      batch_year,
      department,
      phone,
      bio,
      profile_image,
      linkedin_url,
      github_url,
      current_company,
      current_position,
      location,
      skills,
      interests,
    } = req.body;

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (college) {
      updates.push(`college = $${paramCount++}`);
      values.push(college);
    }
    if (batch_year) {
      updates.push(`batch_year = $${paramCount++}`);
      values.push(batch_year);
    }
    if (department) {
      updates.push(`department = $${paramCount++}`);
      values.push(department);
    }
    if (phone) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (bio) {
      updates.push(`bio = $${paramCount++}`);
      values.push(bio);
    }
    if (profile_image) {
      updates.push(`profile_image = $${paramCount++}`);
      values.push(profile_image);
    }
    if (linkedin_url) {
      updates.push(`linkedin_url = $${paramCount++}`);
      values.push(linkedin_url);
    }
    if (github_url) {
      updates.push(`github_url = $${paramCount++}`);
      values.push(github_url);
    }
    if (current_company) {
      updates.push(`current_company = $${paramCount++}`);
      values.push(current_company);
    }
    if (current_position) {
      updates.push(`current_position = $${paramCount++}`);
      values.push(current_position);
    }
    if (location) {
      updates.push(`location = $${paramCount++}`);
      values.push(location);
    }
    if (skills) {
      updates.push(`skills = $${paramCount++}`);
      values.push(skills);
    }
    if (interests) {
      updates.push(`interests = $${paramCount++}`);
      values.push(interests);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    if (values.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update.',
      });
    }

    values.push(userId);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    const user = sanitizeUser(result.rows[0]);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};
