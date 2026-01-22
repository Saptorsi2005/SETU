import pool from '../config/database.js';
import { hashPassword, comparePassword, isValidEmail } from '../utils/helpers.js';
import { generateToken } from '../utils/jwt.js';
import { uploadDocumentToCloudinary } from '../config/cloudinary.js';

/**
 * Student Auth Controller
 * Handles student signup with ID card upload
 */

/**
 * Student signup (direct registration without OTP)
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

    // Validate required fields
    if (!full_name || !email || !password || !roll_number || !department || !graduation_year) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: full_name, email, password, roll_number, department, graduation_year.',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const lowerEmail = email.toLowerCase();

    // Check if student already exists
    const existingStudent = await pool.query(
      'SELECT * FROM students WHERE email = $1',
      [lowerEmail]
    );

    if (existingStudent.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A student account with this email already exists.',
      });
    }

    // Check if roll number already exists
    const existingRollNumber = await pool.query(
      'SELECT * FROM students WHERE roll_number = $1',
      [roll_number]
    );

    if (existingRollNumber.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This roll number is already registered.',
      });
    }

    // Validate graduation year
    const gradYear = parseInt(graduation_year);
    const currentYear = new Date().getFullYear();
    if (isNaN(gradYear) || gradYear < currentYear -10 || gradYear > currentYear + 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid graduation year.',
      });
    }

    // Handle ID card upload
    let idCardUrl = null;
    if (req.file) {
      try {
        idCardUrl = await uploadDocumentToCloudinary(
          req.file.buffer,
          req.file.mimetype,
          'setu/student_ids'
        );
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload student ID card. Please try again.',
        });
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create student account
    const result = await pool.query(
      `INSERT INTO students (
        full_name, email, password_hash, roll_number, 
        department, graduation_year, student_id_card_url, is_email_verified
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
       RETURNING student_id, full_name, email, roll_number, department, graduation_year, student_id_card_url, is_email_verified, created_at`,
      [full_name, lowerEmail, passwordHash, roll_number, department, gradYear, idCardUrl]
    );

    const student = result.rows[0];

    // Generate JWT token
    const token = generateToken({
      id: student.student_id,
      email: student.email,
      role: 'student',
    });

    res.status(201).json({
      success: true,
      message: 'Student account created successfully!',
      data: {
        student: {
          student_id: student.student_id,
          user_id: student.student_id, // Normalize ID field
          full_name: student.full_name,
          name: student.full_name, // Normalize name field
          email: student.email,
          roll_number: student.roll_number,
          department: student.department,
          graduation_year: student.graduation_year,
          student_id_card_url: student.student_id_card_url,
          is_email_verified: student.is_email_verified,
          created_at: student.created_at,
          role: 'student',
        },
        token,
      },
    });
  } catch (error) {
    console.error('Error creating student account:', error);
    next(error);
  }
};

/**
 * Student login (separate from regular login)
 * POST /api/auth/student/login
 */
export const studentLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const lowerEmail = email.toLowerCase();

    // Find student
    const result = await pool.query(
      'SELECT * FROM students WHERE email = $1',
      [lowerEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const student = result.rows[0];

    // Verify password
    const isValidPassword = await comparePassword(password, student.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: student.student_id,
      email: student.email,
      role: 'student',
    });

    // Return student data normalized to match app expectations
    const { password_hash, ...studentData } = student;

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: {
        student: {
          ...studentData,
          user_id: studentData.student_id, // Normalize ID field
          name: studentData.full_name, // Normalize name field
          role: 'student',
        },
        token,
      },
    });
  } catch (error) {
    console.error('Error during student login:', error);
    next(error);
  }
};
