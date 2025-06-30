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

export default router;