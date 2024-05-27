const express = require("express");
const {
  addMovie,
  getAllMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
} = require("../controllers/movieController");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/movies", authMiddleware, roleMiddleware(["admin"]), addMovie);
router.get("/movies", authMiddleware, getAllMovies);
router.get("/movies/:id", authMiddleware, getMovieById);
router.put(
  "/movies/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateMovie
);
router.delete(
  "/movies/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteMovie
);

module.exports = router;
