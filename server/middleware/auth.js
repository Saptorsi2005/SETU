import { verifyToken } from '../utils/jwt.js';

// Middleware to verify JWT token
export const authenticate = (req, res, next) => {
  try {
    // Get token from header or cookie
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.',
      });
    }

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
};

// Middleware to check if user is admin
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }
};

// Middleware to check if user is student
export const isStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Student privileges required.',
    });
  }
};

// Middleware to check if user is alumni
export const isAlumni = (req, res, next) => {
  if (req.user && req.user.role === 'alumni') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Alumni privileges required.',
    });
  }
};

// Middleware to check if user is student or alumni
export const isStudentOrAlumni = (req, res, next) => {
  if (req.user && (req.user.role === 'student' || req.user.role === 'alumni')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Student or Alumni privileges required.',
    });
  }
};
