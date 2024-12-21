const express = require("express");
const {
  fetchMoviesByCategory,
  fetchMovieById,
  fetchMovieByIdDB,
  updateMovie,
  deleteMovie,
  saveMovie,
  fetchMoviesByCategoryAndGenre,
} = require("../controllers/movieController");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middlewares/authMiddleware");

const router = express.Router();

// Fetch movies by category
router.get("/movies", fetchMoviesByCategory);

// Fetch a movie from the database by ID
router.get("/movies/db/:id", fetchMovieByIdDB);

// Fetch a movie from TMDB by ID
router.get("/movies/:id", fetchMovieById);

// Save a new movie (Admin only)
router.post("/movies", authMiddleware, roleMiddleware(["admin"]), saveMovie);

// Fetch a movie from database by Category ,genre
router.get(
  "/movies/all/movies",
  authMiddleware,
  roleMiddleware(["admin"]),
  fetchMoviesByCategoryAndGenre
);

// Update an existing movie by ID (Admin only)
router.put(
  "/movies/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateMovie
);

// Delete a movie by ID (Admin only)
router.delete(
  "/movies/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteMovie
);

module.exports = router;
