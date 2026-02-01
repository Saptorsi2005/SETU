import pool from '../config/database.js';
import { hashPassword, comparePassword, isValidEmail } from '../utils/helpers.js';
import { generateToken } from '../utils/jwt.js';
import { uploadDocumentToCloudinary } from '../config/cloudinary.js';

/**
 * Student signup
 * POST /api/auth/student/signup
 */
export const studentSignup = async (req, res, next) => {
  try {
    const {
      full_name,
      email,
      password,
      roll_number,
      department,
      graduation_year,
    } = req.body;

    if (!full_name || !email || !password || !roll_number || !department || !graduation_year) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    const lowerEmail = email.toLowerCase();

    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [lowerEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists.',
      });
    }

    const gradYear = parseInt(graduation_year);
    const currentYear = new Date().getFullYear();
    if (isNaN(gradYear) || gradYear < currentYear - 10 || gradYear > currentYear + 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid graduation year.',
      });
    }

    let idCardUrl = null;
    if (req.file) {
      idCardUrl = await uploadDocumentToCloudinary(
        req.file.buffer,
        req.file.mimetype,
        'setu/student_ids'
      );
    }

    const passwordHash = await hashPassword(password);

    const result = await pool.query(
      `INSERT INTO users (
        name, email, password, role, college, batch_year,
        department, verification_document
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        full_name,
        lowerEmail,
        passwordHash,
        'student',
        'Academy of Technology',
        gradYear,
        department,
        idCardUrl,
      ]
    );

    const user = result.rows[0];

    // ✅ Token generation is OK here (NO cookie on signup)
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: 'Student account created successfully!',
      data: {
        user: {
          id: user.id,
          user_id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          college: user.college,
          batch_year: user.batch_year,
          department: user.department,
          verification_status: user.verification_status || 'PENDING',
          is_verified: user.is_verified || false,
        },
        token, // optional
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Student login
 * POST /api/auth/student/login
 */
export const studentLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required.',
      });
    }

    const lowerEmail = email.toLowerCase();

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND role = $2',
      [lowerEmail, 'student']
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account deactivated.',
      });
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // ✅ CRITICAL FIX — SET COOKIE
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,     // REQUIRED on HTTPS (Vercel + Render)
      sameSite: 'none', // REQUIRED for cross-domain
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...userData } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: {
        user: {
          ...userData,
          user_id: userData.id,
          verification_status: userData.verification_status,
          is_verified: userData.is_verified,
        },
        token, // optional (frontend may ignore)
      },
    });
  } catch (error) {
    next(error);
  }
};
