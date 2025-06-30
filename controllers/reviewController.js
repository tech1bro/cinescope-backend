import Review from '../models/Review.js';
import Movie from '../models/Movie.js';
import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Helper function to update movie rating
const updateMovieRating = async (movieId) => {
  try {
    const reviews = await Review.find({ movie: movieId });
    
    if (reviews.length > 0) {
      const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
      
      await Movie.findByIdAndUpdate(movieId, {
        'localRating.average': Math.round(averageRating * 10) / 10,
        'localRating.count': reviews.length
      });
    }
  } catch (error) {
    console.error('Error updating movie rating:', error);
  }
};

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
export const getReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;
    
    const reviews = await Review.find()
      .populate('user', 'name avatar')
      .populate('movie')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments();

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
export const getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('movie');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res, next) => {
  try {
    const { tmdbId, rating, title, content, spoilers = false } = req.body;

    if (!tmdbId || !rating || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'TMDB ID, rating, title, and content are required'
      });
    }

    // Check if user already reviewed this movie
    const existingReview = await Review.findOne({
      user: req.user.id,
      tmdbId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this movie'
      });
    }

    // Get or create movie
    let movie = await Movie.findOne({ tmdbId });
    
    if (!movie) {
      try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
          params: { api_key: TMDB_API_KEY }
        });
        
        const tmdbMovie = response.data;
        
        movie = await Movie.create({
          tmdbId: tmdbMovie.id,
          title: tmdbMovie.title,
          overview: tmdbMovie.overview,
          releaseDate: tmdbMovie.release_date ? new Date(tmdbMovie.release_date) : null,
          genres: tmdbMovie.genres,
          posterPath: tmdbMovie.poster_path,
          backdropPath: tmdbMovie.backdrop_path,
          voteAverage: tmdbMovie.vote_average,
          voteCount: tmdbMovie.vote_count,
          popularity: tmdbMovie.popularity
        });
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid movie ID'
        });
      }
    }

    // Create review
    const review = await Review.create({
      user: req.user.id,
      movie: movie._id,
      tmdbId,
      rating,
      title,
      content,
      spoilers
    });

    // Update movie rating
    await updateMovieRating(movie._id);

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name avatar')
      .populate('movie');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: populatedReview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res, next) => {
  try {
    const { rating, title, content, spoilers } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    // Update review
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      {
        ...(rating && { rating }),
        ...(title && { title }),
        ...(content && { content }),
        ...(spoilers !== undefined && { spoilers }),
        isEdited: true,
        editedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('user', 'name avatar').populate('movie');

    // Update movie rating if rating changed
    if (rating) {
      await updateMovieRating(review.movie);
    }

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    // Update movie rating
    await updateMovieRating(review.movie);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like review
// @route   POST /api/reviews/:id/like
// @access  Private
export const likeReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already liked the review
    const alreadyLiked = review.likes.some(like => like.user.toString() === req.user.id);

    if (alreadyLiked) {
      return res.status(400).json({
        success: false,
        message: 'Review already liked'
      });
    }

    // Add like
    review.likes.push({ user: req.user.id });
    review.likesCount = review.likes.length;
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review liked successfully',
      data: { likesCount: review.likesCount }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unlike review
// @route   DELETE /api/reviews/:id/like
// @access  Private
export const unlikeReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Remove like
    review.likes = review.likes.filter(like => like.user.toString() !== req.user.id);
    review.likesCount = review.likes.length;
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review unliked successfully',
      data: { likesCount: review.likesCount }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a movie
// @route   GET /api/reviews/movie/:tmdbId
// @access  Public
export const getMovieReviews = async (req, res, next) => {
  try {
    const { tmdbId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;
    
    const reviews = await Review.find({ tmdbId })
      .populate('user', 'name avatar')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ tmdbId });

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews by user
// @route   GET /api/reviews/user/:userId
// @access  Public
export const getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;
    
    const reviews = await Review.find({ user: userId })
      .populate('movie')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};