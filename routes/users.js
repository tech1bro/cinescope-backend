import express from 'express';
import {
  getUsers,
  getUser,
  getUserStats,
  getUserActivity
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getUsers);
router.get('/:id', getUser);
router.get('/:id/stats', getUserStats);
router.get('/:id/activity', getUserActivity);

export default router;