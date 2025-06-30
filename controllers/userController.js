import User from '../models/User.js';
import Watchlist from '../models/Watchlist.js';
import Favorite from '../models/Favorite.js';
import Review from '../models/Review.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    const query = search 
      ? { 
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Private
export const getUserStats = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Get user
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get statistics
    const [watchlistStats, favoriteStats, reviewStats] = await Promise.all([
      Watchlist.aggregate([
        { $match: { user: user._id } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            watched: { $sum: { $cond: ['$watched', 1, 0] } },
            unwatched: { $sum: { $cond: ['$watched', 0, 1] } }
          }
        }
      ]),
      Favorite.countDocuments({ user: userId }),
      Review.aggregate([
        { $match: { user: user._id } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            averageRating: { $avg: '$rating' },
            totalLikes: { $sum: '$likesCount' }
          }
        }
      ])
    ]);

    const stats = {
      watchlist: watchlistStats[0] || { total: 0, watched: 0, unwatched: 0 },
      favorites: favoriteStats,
      reviews: reviewStats[0] || { total: 0, averageRating: 0, totalLikes: 0 }
    };

    res.status(200).json({
      success: true,
      data: {
        user,
        stats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user activity
// @route   GET /api/users/:id/activity
// @access  Private
export const getUserActivity = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { limit = 10 } = req.query;

    // Get recent activity
    const [recentWatchlist, recentFavorites, recentReviews] = await Promise.all([
      Watchlist.find({ user: userId })
        .populate('movie')
        .sort({ createdAt: -1 })
        .limit(limit),
      Favorite.find({ user: userId })
        .populate('movie')
        .sort({ createdAt: -1 })
        .limit(limit),
      Review.find({ user: userId })
        .populate('movie')
        .sort({ createdAt: -1 })
        .limit(limit)
    ]);

    // Combine and sort all activities
    const activities = [
      ...recentWatchlist.map(item => ({
        type: 'watchlist',
        action: item.watched ? 'watched' : 'added_to_watchlist',
        movie: item.movie,
        date: item.watched ? item.watchedAt : item.createdAt,
        data: item
      })),
      ...recentFavorites.map(item => ({
        type: 'favorite',
        action: 'added_to_favorites',
        movie: item.movie,
        date: item.createdAt,
        data: item
      })),
      ...recentReviews.map(item => ({
        type: 'review',
        action: 'reviewed',
        movie: item.movie,
        date: item.createdAt,
        data: item
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};