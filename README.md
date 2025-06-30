# CineScope Backend API

A comprehensive backend API for the CineScope movie recommendation platform built with Node.js, Express, and MongoDB.

## Features

- **User Authentication**: JWT-based authentication with registration, login, and profile management
- **Movie Data**: Integration with TMDB API for comprehensive movie information
- **Watchlist Management**: Add, remove, and track watched movies
- **Favorites System**: Save and manage favorite movies
- **Review System**: Create, update, delete, and like movie reviews
- **User Statistics**: Track user activity and preferences
- **Security**: Helmet, rate limiting, CORS, and input validation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **External API**: TMDB (The Movie Database)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure secret key for JWT tokens
   - `TMDB_API_KEY`: Your TMDB API key
   - `PORT`: Server port (default: 5000)

5. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `DELETE /api/auth/account` - Delete account

### Movies
- `GET /api/movies/search` - Search movies
- `GET /api/movies/popular` - Get popular movies
- `GET /api/movies/trending` - Get trending movies
- `GET /api/movies/top-rated` - Get top rated movies
- `GET /api/movies/:id` - Get movie details
- `GET /api/movies/:id/recommendations` - Get movie recommendations
- `GET /api/movies/genre/:genreId` - Get movies by genre

### Watchlist
- `GET /api/watchlist` - Get user's watchlist
- `POST /api/watchlist` - Add movie to watchlist
- `DELETE /api/watchlist/:tmdbId` - Remove from watchlist
- `PATCH /api/watchlist/:tmdbId/watched` - Mark as watched
- `PATCH /api/watchlist/:tmdbId/unwatched` - Mark as unwatched
- `PATCH /api/watchlist/:tmdbId` - Update watchlist item

### Reviews
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/:id` - Get single review
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `POST /api/reviews/:id/like` - Like review
- `DELETE /api/reviews/:id/like` - Unlike review
- `GET /api/reviews/movie/:tmdbId` - Get movie reviews
- `GET /api/reviews/user/:userId` - Get user reviews

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `GET /api/users/:id/stats` - Get user statistics
- `GET /api/users/:id/activity` - Get user activity

## Database Models

### User
- Personal information (name, email, avatar)
- Authentication (hashed password)
- Preferences (favorite genres, languages)
- Account status and timestamps

### Movie
- TMDB integration data
- Local statistics (ratings, watchlist count)
- Production information
- Genre and language data

### Watchlist
- User-movie relationship
- Watch status and timestamps
- Priority and notes
- Compound indexing for performance

### Favorite
- User-movie relationship
- Timestamps for activity tracking

### Review
- User ratings and written reviews
- Like system with counts
- Spoiler warnings
- Edit tracking

## Security Features

- **Helmet**: Security headers
- **Rate Limiting**: Prevent abuse
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Express Validator
- **Password Hashing**: bcryptjs
- **JWT Authentication**: Secure token-based auth

## Deployment

### Environment Setup
1. Set production environment variables
2. Configure MongoDB Atlas or production database
3. Set secure JWT secret
4. Configure CORS origins for production domains

### Render Deployment
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy with automatic builds on push

### Build Command
```bash
npm install
```

### Start Command
```bash
npm start
```

## Development

### Scripts
- `npm run dev` - Development with nodemon
- `npm start` - Production start
- `npm test` - Run tests

### Code Structure
```
backend/
├── controllers/     # Route handlers
├── middleware/      # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── server.js       # Main server file
└── package.json    # Dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details