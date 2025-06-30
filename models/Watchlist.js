import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  tmdbId: {
    type: Number,
    required: true
  },
  watched: {
    type: Boolean,
    default: false
  },
  watchedAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate entries
watchlistSchema.index({ user: 1, tmdbId: 1 }, { unique: true });

// Index for better query performance
watchlistSchema.index({ user: 1, watched: 1 });
watchlistSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Watchlist', watchlistSchema);