const express = require("express");
const {
  getAllMovieBanner,
  getAllMoviesByCategory,
  getMovieById,
  getMoviesCountByCategory,
  getAllSeriesBanner,
  getAllSeriesByCategory,
  getSerieseById,
  getSeriesCountByCategory,
} = require("../controllers/userController");
const { secretMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/banner/movies", secretMiddleware, getAllMovieBanner);
router.get(
  "/movies/category/:categorytitle",
  secretMiddleware,
  getAllMoviesByCategory
);
router.get("/movies/:id", getMovieById);
router.get(
  "/movies/count/:category",
  secretMiddleware,
  getMoviesCountByCategory
);

router.get("/banner/series", secretMiddleware, getAllSeriesBanner);
router.get(
  "/series/category/:categorytitle",
  secretMiddleware,
  getAllSeriesByCategory
);
router.get("/series/:id", secretMiddleware, getSerieseById);
router.get(
  "/series/count/:category",
  secretMiddleware,
  getSeriesCountByCategory
);
module.exports = router;
