import express from 'express';
import {
  searchMovies,
  getMovieDetails,
  getPopularMovies,
  getTrendingMovies,
  getTopRatedMovies,
  getMovieRecommendations,
  getMoviesByGenre,
  getPersonalRecommendations
} from '../controllers/movieController.js';

import { protect } from '../middleware/auth.js';



const router = express.Router();

// backend/routes/movies.js
router.get('/trending', async (req, res) => {
  const url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.TMDB_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  res.json(data);
});


// Public routes
router.get('/search', searchMovies);
router.get('/popular', getPopularMovies);
router.get('/trending', getTrendingMovies);
router.get('/top-rated', getTopRatedMovies);
router.get('/genre/:genreId', getMoviesByGenre);

// Authenticated recommendation route
router.get('/recommend/personal', protect, getPersonalRecommendations);

// Place this **after** specific routes
router.get('/:id/recommendations', getMovieRecommendations);
router.get('/:id', getMovieDetails);

export default router;
