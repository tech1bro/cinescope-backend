import axios from 'axios';
import Movie from '../models/Movie.js';
import dotenv from 'dotenv';
dotenv.config();

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Helper: Make TMDB API request
const tmdbRequest = async (endpoint, params = {}) => {
  try {
    if (!TMDB_API_KEY) {
      throw new Error('TMDB_API_KEY is missing from environment variables');
    }

    const response = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
      params: {
        api_key: TMDB_API_KEY,
        ...params,
      },
    });

    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    const message = error?.response?.data?.status_message || error.message;
    console.error(`TMDB API Error (${status}): ${message}`);
    throw new Error(`TMDB API Error: ${message}`);
  }
};

// Helper: Save movie to MongoDB
const saveMovieToDb = async (tmdbMovie) => {
  try {
    const movieData = {
      tmdbId: tmdbMovie.id,
      title: tmdbMovie.title,
      overview: tmdbMovie.overview,
      releaseDate: tmdbMovie.release_date ? new Date(tmdbMovie.release_date) : null,
      runtime: tmdbMovie.runtime,
      genres: tmdbMovie.genres || tmdbMovie.genre_ids?.map(id => ({ id, name: '' })),
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
      spokenLanguages: tmdbMovie.spoken_languages,
    };

    const movie = await Movie.findOneAndUpdate(
      { tmdbId: tmdbMovie.id },
      movieData,
      { upsert: true, new: true, runValidators: true }
    );

    return movie;
  } catch (error) {
    console.error('Error saving movie to database:', error);
    return null;
  }
};

// CONTROLLERS

export const searchMovies = async (req, res, next) => {
  try {
    const { query, page = 1 } = req.query;
    if (!query) return res.status(400).json({ success: false, message: 'Search query is required' });

    const data = await tmdbRequest('/search/movie', { query, page });
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getMovieDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const movieData = await tmdbRequest(`/movie/${id}`);
    await saveMovieToDb(movieData);

    const localMovie = await Movie.findOne({ tmdbId: id });
    res.status(200).json({ success: true, data: { ...movieData, localData: localMovie } });
  } catch (error) {
    next(error);
  }
};

export const getPopularMovies = async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    const data = await tmdbRequest('/movie/popular', { page });
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getTrendingMovies = async (req, res, next) => {
  try {
    const { timeWindow = 'week' } = req.query;
    const data = await tmdbRequest(`/trending/movie/${timeWindow}`);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getTopRatedMovies = async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    const data = await tmdbRequest('/movie/top_rated', { page });
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getMovieRecommendations = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1 } = req.query;
    const data = await tmdbRequest(`/movie/${id}/recommendations`, { page });
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getMoviesByGenre = async (req, res, next) => {
  try {
    const { genreId } = req.params;
    const { page = 1, sortBy = 'popularity.desc' } = req.query;

    const data = await tmdbRequest('/discover/movie', {
      with_genres: genreId,
      page,
      sort_by: sortBy
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getPersonalRecommendations = async (req, res, next) => {
  try {
    const user = req.user;
    const favoriteGenres = user?.preferences?.favoriteGenres;

    if (!favoriteGenres?.length) {
      return res.status(400).json({ success: false, message: 'No favorite genres found in user preferences' });
    }

    const genreMap = {
      Action: 28,
      Adventure: 12,
      Animation: 16,
      Comedy: 35,
      Crime: 80,
      Documentary: 99,
      Drama: 18,
      Family: 10751,
      Fantasy: 14,
      History: 36,
      Horror: 27,
      Music: 10402,
      Mystery: 9648,
      Romance: 10749,
      'Science Fiction': 878,
      'TV Movie': 10770,
      Thriller: 53,
      War: 10752,
      Western: 37,
    };

    const genreIds = favoriteGenres.map(name => genreMap[name]).filter(Boolean);

    const data = await tmdbRequest('/discover/movie', {
      with_genres: genreIds.join(','),
      sort_by: 'popularity.desc',
      page: 1
    });

    res.status(200).json({ success: true, data, basedOn: favoriteGenres });
  } catch (error) {
    next(error);
  }
};
