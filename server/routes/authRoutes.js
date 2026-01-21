import express from 'express';
import { register, login, logout, getProfile, updateProfile, alumniSignup } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadIdCard } from '../config/multer.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/alumni/signup', uploadIdCard.single('verification_document'), alumniSignup);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;
