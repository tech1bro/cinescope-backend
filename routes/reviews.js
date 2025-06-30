import express from 'express';
import {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  likeReview,
  unlikeReview,
  getMovieReviews,
  getUserReviews
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getReviews);
router.get('/movie/:tmdbId', getMovieReviews);
router.get('/user/:userId', getUserReviews);
router.get('/:id', getReview);

// Protected routes
router.use(protect);
router.post('/', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
router.post('/:id/like', likeReview);
router.delete('/:id/like', unlikeReview);

export default router;