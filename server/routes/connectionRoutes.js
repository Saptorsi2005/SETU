import express from 'express';
import {
  createConnection,
  getConnections,
  checkConnection,
  deleteConnection,
} from '../controllers/connectionController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create new connection
router.post('/', createConnection);

// Get all connections for current user
router.get('/', getConnections);

// Check if connected with specific mentor
router.get('/check/:mentorName', checkConnection);

// Delete connection
router.delete('/:connectionId', deleteConnection);

export default router;
