import express from 'express';
import {
  createEvent,
  getAllEvents,
  getEventById,
  registerForEvent,
  getMyRegistrations,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';
import { authenticate, isAdmin, isAlumni, isStudent, isStudentOrAlumni } from '../middleware/auth.js';

const router = express.Router();

// Public routes (anyone can view events)
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Protected routes - Create event (admin and alumni only)
router.post('/', authenticate, async (req, res, next) => {
  // Check if user is admin or alumni
  if (req.user.role === 'admin' || req.user.role === 'alumni') {
    return createEvent(req, res, next);
  }
  return res.status(403).json({
    success: false,
    message: 'Only admins and alumni can create events.',
  });
});

// Update event (organizer only)
router.put('/:id', authenticate, updateEvent);

// Delete event (organizer only)
router.delete('/:id', authenticate, deleteEvent);

// Student registration (students only)
router.post('/:id/register', authenticate, isStudent, registerForEvent);

// Get my registrations (students only)
router.get('/my/registrations', authenticate, isStudent, getMyRegistrations);

export default router;
