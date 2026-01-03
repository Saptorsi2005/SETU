import express from 'express';
import { adminLogin, createAdmin, getAdminProfile, getAllUsers } from '../controllers/adminController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', adminLogin);

// Protected admin routes
router.get('/profile', authenticate, isAdmin, getAdminProfile);
router.post('/create', authenticate, isAdmin, createAdmin);
router.get('/users', authenticate, isAdmin, getAllUsers);

export default router;
