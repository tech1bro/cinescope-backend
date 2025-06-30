import express from 'express';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  markAsWatched,
  markAsUnwatched,
  updateWatchlistItem
} from '../controllers/watchlistController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getWatchlist);
router.post('/', addToWatchlist);
router.delete('/:tmdbId', removeFromWatchlist);
router.patch('/:tmdbId/watched', markAsWatched);
router.patch('/:tmdbId/unwatched', markAsUnwatched);
router.patch('/:tmdbId', updateWatchlistItem);

export default router;