import Watchlist from '../models/Watchlist.js';
import Movie from '../models/Movie.js';
import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Helper function to get movie from TMDB and save to DB
const getOrCreateMovie = async (tmdbId) => {
  try {
    let movie = await Movie.findOne({ tmdbId });
    
    if (!movie) {
      // Fetch from TMDB
      const response = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
        params: { api_key: TMDB_API_KEY }
      });
      
      const tmdbMovie = response.data;
      
      // Save to database
      movie = await Movie.create({
        tmdbId: tmdbMovie.id,
        title: tmdbMovie.title,
        overview: tmdbMovie.overview,
        releaseDate: tmdbMovie.release_date ? new Date(tmdbMovie.release_date) : null,
        runtime: tmdbMovie.runtime,
        genres: tmdbMovie.genres,
        posterPath: tmdbMovie.poster_path,
        backdropPath: tmdbMovie.backdrop_path,
        voteAverage: tmdbMovie.vote_average,
        voteCount: tmdbMovie.vote_count,
        popularity: tmdbMovie.popularity,
        adult: tmdbMovie.adult,
        originalLanguage: tmdbMovie.original_language,
        budget: tmdbMovie.budget,
        revenue: tmdbMovie.revenue,
        status: tmdbMovie.status,
        tagline: tmdbMovie.tagline,
        homepage: tmdbMovie.homepage,
        imdbId: tmdbMovie.imdb_id,
        productionCompanies: tmdbMovie.production_companies,
        productionCountries: tmdbMovie.production_countries,
        spokenLanguages: tmdbMovie.spoken_languages
      });
    }
    
    return movie;
  } catch (error) {
    throw new Error(`Failed to get movie data: ${error.message}`);
  }
};

// @desc    Get user's watchlist
// @route   GET /api/watchlist
// @access  Private
export const getWatchlist = async (req, res, next) => {
  try {
    const { watched, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    const filter = { user: req.user.id };
    if (watched !== undefined) {
      filter.watched = watched === 'true';
    }
    
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;
    
    const watchlist = await Watchlist.find(filter)
      .populate('movie')
      .sort(sortOptions);

    res.status(200).json({
      success: true,
      count: watchlist.length,
      data: watchlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add movie to watchlist
// @route   POST /api/watchlist
// @access  Private
export const addToWatchlist = async (req, res, next) => {
  try {
    const { tmdbId, priority = 'medium', notes } = req.body;

    if (!tmdbId) {
      return res.status(400).json({
        success: false,
        message: 'TMDB ID is required'
      });
    }

    // Check if already in watchlist
    const existingItem = await Watchlist.findOne({
      user: req.user.id,
      tmdbId
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Movie is already in your watchlist'
      });
    }

    // Get or create movie
    const movie = await getOrCreateMovie(tmdbId);

    // Create watchlist item
    const watchlistItem = await Watchlist.create({
      user: req.user.id,
      movie: movie._id,
      tmdbId,
      priority,
      notes
    });

    // Update movie watchlist count
    await Movie.findByIdAndUpdate(movie._id, {
      $inc: { watchlistCount: 1 }
    });

    const populatedItem = await Watchlist.findById(watchlistItem._id).populate('movie');

    res.status(201).json({
      success: true,
      message: 'Movie added to watchlist',
      data: populatedItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove movie from watchlist
// @route   DELETE /api/watchlist/:tmdbId
// @access  Private
export const removeFromWatchlist = async (req, res, next) => {
  try {
    const { tmdbId } = req.params;

    const watchlistItem = await Watchlist.findOneAndDelete({
      user: req.user.id,
      tmdbId
    });

    if (!watchlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found in watchlist'
      });
    }

    // Update movie watchlist count
    await Movie.findByIdAndUpdate(watchlistItem.movie, {
      $inc: { watchlistCount: -1 }
    });

    res.status(200).json({
      success: true,
      message: 'Movie removed from watchlist'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark movie as watched
// @route   PATCH /api/watchlist/:tmdbId/watched
// @access  Private
export const markAsWatched = async (req, res, next) => {
  try {
    const { tmdbId } = req.params;

    const watchlistItem = await Watchlist.findOneAndUpdate(
      {
        user: req.user.id,
        tmdbId
      },
      {
        watched: true,
        watchedAt: new Date()
      },
      { new: true }
    ).populate('movie');

    if (!watchlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found in watchlist'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Movie marked as watched',
      data: watchlistItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark movie as unwatched
// @route   PATCH /api/watchlist/:tmdbId/unwatched
// @access  Private
export const markAsUnwatched = async (req, res, next) => {
  try {
    const { tmdbId } = req.params;

    const watchlistItem = await Watchlist.findOneAndUpdate(
      {
        user: req.user.id,
        tmdbId
      },
      {
        watched: false,
        $unset: { watchedAt: 1 }
      },
      { new: true }
    ).populate('movie');

    if (!watchlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found in watchlist'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Movie marked as unwatched',
      data: watchlistItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update watchlist item
// @route   PATCH /api/watchlist/:tmdbId
// @access  Private
export const updateWatchlistItem = async (req, res, next) => {
  try {
    const { tmdbId } = req.params;
    const { priority, notes } = req.body;

    const updateData = {};
    if (priority) updateData.priority = priority;
    if (notes !== undefined) updateData.notes = notes;

    const watchlistItem = await Watchlist.findOneAndUpdate(
      {
        user: req.user.id,
        tmdbId
      },
      updateData,
      { new: true, runValidators: true }
    ).populate('movie');

    if (!watchlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found in watchlist'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Watchlist item updated',
      data: watchlistItem
    });
  } catch (error) {
    next(error);
  }
};