import Watchlist from '../models/Watchlist.js';
import Movie from '../models/Movie.js';

// @desc    Get user's watchlist
// @route   GET /api/watchlist
// @access  Private
export const getWatchlist = async (req, res, next) => {
  try {
    const watchlist = await Watchlist.find({ user: req.user.id })
      .populate('movie')
      .sort({ createdAt: -1 });

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
    const { tmdbId, movieId } = req.body;

    if (!tmdbId || !movieId) {
      return res.status(400).json({
        success: false,
        message: 'tmdbId and movieId are required'
      });
    }

    const existing = await Watchlist.findOne({
      user: req.user.id,
      tmdbId
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Movie already exists in your watchlist'
      });
    }

    const watchlistItem = await Watchlist.create({
      user: req.user.id,
      movie: movieId,
      tmdbId
    });

    res.status(201).json({
      success: true,
      message: 'Added to watchlist',
      data: watchlistItem
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

    const removed = await Watchlist.findOneAndDelete({
      user: req.user.id,
      tmdbId
    });

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found in watchlist'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Removed from watchlist'
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
    const item = await Watchlist.findOneAndUpdate(
      { user: req.user.id, tmdbId: req.params.tmdbId },
      { watched: true, watchedAt: new Date() },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Marked as watched',
      data: item
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
    const item = await Watchlist.findOneAndUpdate(
      { user: req.user.id, tmdbId: req.params.tmdbId },
      { watched: false, watchedAt: null },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Marked as unwatched',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update notes/priority
// @route   PATCH /api/watchlist/:tmdbId
// @access  Private
export const updateWatchlistItem = async (req, res, next) => {
  try {
    const { notes, priority } = req.body;

    const item = await Watchlist.findOneAndUpdate(
      { user: req.user.id, tmdbId: req.params.tmdbId },
      {
        ...(notes && { notes }),
        ...(priority && { priority })
      },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Watchlist item updated',
      data: item
    });
  } catch (error) {
    next(error);
  }
};
