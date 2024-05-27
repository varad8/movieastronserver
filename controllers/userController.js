const axios = require("axios");
const Movie = require("../models/Movie");
const Category = require("../models/Category");
const dotenv = require("dotenv");
const Series = require("../models/Series");

dotenv.config();

//Get All Movie Banner for Homepage
const getAllMovieBanner = async (req, res) => {
  try {
    // Define categories to fetch
    const categoriesToFetch = [
      "Hollywood",
      "Bollywood",
      "Tollywood",
      "Kids Movie",
      "Anime Movie",
    ];
    const moviePromises = categoriesToFetch.map(async (categoryName) => {
      const category = await Category.findOne({ name: categoryName });
      if (category) {
        const movies = await Movie.find({ category: category._id })
          .limit(5)
          .exec();
        return movies.map((movie) => ({
          title: movie.title,
          plot: movie.plot,
          year: movie.year,
          rated: movie.rated,
          released: movie.released,
          runtime: movie.runtime,
          genre: movie.genre,
          language: movie.language,
          country: movie.country,
          poster: movie.poster,
          imdbRating: movie.imdbRating,
          imdbVotes: movie.imdbVotes,
          imdbID: movie.imdbID,
          category: category.name,
          _id: movie._id,
        }));
      }
      return [];
    });

    // Wait for all promises to resolve
    const movieResults = await Promise.all(moviePromises);

    // Combine results into a single response
    const response = movieResults.flat();

    // Send the response
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
};

// Get All  Movies by Category
const getAllMoviesByCategory = async (req, res) => {
  const { categorytitle } = req.params; // Extract category title from URL parameters
  const { genre, year, imdbRating } = req.query; // Extract filters from query parameters

  const query = {}; // Initialize query object

  // Add filters to query object if they exist
  if (genre) query.genre = genre;
  if (year) query.year = year;
  if (imdbRating) query.imdbRating = imdbRating;

  try {
    // Find the category by title
    const categoryDoc = await Category.findOne({ name: categorytitle });
    if (!categoryDoc) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Add the category filter to the query object
    query.category = categoryDoc._id;

    let movies;
    if (Object.keys(req.query).length === 0) {
      // If no filters provided, return all movies with the specified category and fields
      movies = await Movie.find(
        { category: categoryDoc._id },
        {
          poster: 1,
          title: 1,
          genre: 1,
          year: 1,
          country: 1,
          language: 1,
          imdbRating: 1,
          runtime: 1,
          category: 1,
          imdbID: 1,
          _id: 1,
          released: 1,
        }
      );
    } else {
      // If filters provided, return query result with specified fields
      movies = await Movie.find(query, {
        poster: 1,
        title: 1,
        genre: 1,
        year: 1,
        country: 1,
        language: 1,
        imdbRating: 1,
        runtime: 1,
        category: 1,
        imdbID: 1,
        _id: 1,
      });
    }

    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

//Get Movie BY ID
const getMovieById = async (req, res) => {
  const { id } = req.params;
  try {
    const movie = await Movie.findById(id).populate("category");
    if (!movie) {
      return res.status(404).send({ error: "Movie not found." });
    }
    res.send(movie);
  } catch (error) {
    res.status(400).send({ error: "Error fetching movie." });
  }
};

// Get Movie Count By Category
const getMoviesCountByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    // Find the category by name
    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Count the number of movies that match the category
    const count = await Movie.countDocuments({ category: categoryDoc._id });

    res.status(200).json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Get Series Banner for homepage of series
const getAllSeriesBanner = async (req, res) => {
  try {
    // Define categories to fetch
    const categoriesToFetch = [
      "Netflix Series",
      "Amzon Original",
      "Hostar Special",
    ];
    const seriesPromises = categoriesToFetch.map(async (categoryName) => {
      const category = await Category.findOne({ name: categoryName });
      if (category) {
        const series = await Series.find({ category: category._id })
          .limit(5)
          .exec();
        return series.map((s) => ({
          title: s.title,
          plot: s.plot,
          year: s.year,
          rated: s.rated,
          released: s.released,
          runtime: s.runtime,
          genre: s.genre,
          language: s.language,
          country: s.country,
          poster: s.poster,
          imdbRating: s.imdbRating,
          imdbVotes: s.imdbVotes,
          imdbID: s.imdbID,
          category: category.name,
          totalSeasons: s.totalSeasons,
          _id: s._id,
        }));
      }
      return [];
    });

    // Wait for all promises to resolve
    const seriesResults = await Promise.all(seriesPromises);

    // Combine results into a single response
    const response = seriesResults.flat();

    // Send the response
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
};

// Get all series by category
const getAllSeriesByCategory = async (req, res) => {
  const { categorytitle } = req.params; // Extract category title from URL parameters
  const { genre, year, imdbRating } = req.query; // Extract filters from query parameters

  const query = {}; // Initialize query object

  // Add filters to query object if they exist
  if (genre) query.genre = genre;
  if (year) query.year = year;
  if (imdbRating) query.imdbRating = imdbRating;

  try {
    // Find the category by title
    const categoryDoc = await Category.findOne({ name: categorytitle });
    if (!categoryDoc) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Add the category filter to the query object
    query.category = categoryDoc._id;

    let series;
    if (Object.keys(req.query).length === 0) {
      // If no filters provided, return all series with the specified category and fields
      series = await Series.find(
        { category: categoryDoc._id },
        {
          poster: 1,
          title: 1,
          genre: 1,
          year: 1,
          country: 1,
          language: 1,
          imdbRating: 1,
          runtime: 1,
          category: 1,
          imdbID: 1,
          _id: 1,
          released: 1,
        }
      );
    } else {
      // If filters provided, return query result with specified fields
      series = await Series.find(query, {
        poster: 1,
        title: 1,
        genre: 1,
        year: 1,
        country: 1,
        language: 1,
        imdbRating: 1,
        runtime: 1,
        category: 1,
        imdbID: 1,
        _id: 1,
      });
    }

    res.json(series);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

//Get Series BY ID
const getSerieseById = async (req, res) => {
  const { id } = req.params;
  try {
    const series = await Series.findById(id).populate("category");
    if (!series) {
      return res.status(404).send({ error: "Series not found." });
    }
    res.send(series);
  } catch (error) {
    res.status(400).send({ error: "Error fetching Series." });
  }
};

// Get Series Count By Category
const getSeriesCountByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    // Find the category by name
    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Count the number of series that match the category
    const count = await Series.countDocuments({ category: categoryDoc._id });

    res.status(200).json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllMovieBanner,
  getAllMoviesByCategory,
  getMovieById,
  getMoviesCountByCategory,
  getAllSeriesBanner,
  getSeriesCountByCategory,
  getAllSeriesByCategory,
  getSerieseById,
};
