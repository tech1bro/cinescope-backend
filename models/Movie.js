import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  tmdbId: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  overview: {
    type: String,
    required: true
  },
  releaseDate: {
    type: Date
  },
  runtime: {
    type: Number
  },
  genres: [{
    id: Number,
    name: String
  }],
  posterPath: {
    type: String
  },
  backdropPath: {
    type: String
  },
  voteAverage: {
    type: Number,
    min: 0,
    max: 10
  },
  voteCount: {
    type: Number,
    default: 0
  },
  popularity: {
    type: Number,
    default: 0
  },
  adult: {
    type: Boolean,
    default: false
  },
  originalLanguage: {
    type: String
  },
  budget: {
    type: Number,
    default: 0
  },
  revenue: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Rumored', 'Planned', 'In Production', 'Post Production', 'Released', 'Canceled']
  },
  tagline: {
    type: String
  },
  homepage: {
    type: String
  },
  imdbId: {
    type: String
  },
  productionCompanies: [{
    id: Number,
    name: String,
    logoPath: String,
    originCountry: String
  }],
  productionCountries: [{
    iso31661: String,
    name: String
  }],
  spokenLanguages: [{
    englishName: String,
    iso6391: String,
    name: String
  }],
  // Local statistics
  localRating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  watchlistCount: {
    type: Number,
    default: 0
  },
  favoriteCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance

movieSchema.index({ title: 'text', overview: 'text' });
movieSchema.index({ 'genres.name': 1 });
movieSchema.index({ releaseDate: -1 });
movieSchema.index({ voteAverage: -1 });
movieSchema.index({ popularity: -1 });

export default mongoose.model('Movie', movieSchema);