import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
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
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate entries
favoriteSchema.index({ user: 1, tmdbId: 1 }, { unique: true });

// Index for better query performance
favoriteSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Favorite', favoriteSchema);