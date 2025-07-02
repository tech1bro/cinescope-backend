import express from 'express';
import {
  searchMovies,
  getMovieDetails,
  getPopularMovies,
  getTrendingMovies,
  getTopRatedMovies,
  getMovieRecommendations,
  getMoviesByGenre
} from '../controllers/movieController.js';

const router = express.Router();

router.get('/search', searchMovies);
router.get('/popular', getPopularMovies);
router.get('/trending', getTrendingMovies);
router.get('/top-rated', getTopRatedMovies);
router.get('/genre/:genreId', getMoviesByGenre);
router.get('/:id', getMovieDetails);
router.get('/:id/recommendations', getMovieRecommendations);

import { getPersonalRecommendations } from '../controllers/movieController.js';
import { protect } from '../middleware/auth.js';

router.get('/recommend/personal', protect, getPersonalRecommendations);


export default router;