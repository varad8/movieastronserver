const axios = require("axios");
const dotenv = require("dotenv");
const Movie = require("../models/Movie");
const fs = require("fs");
const path = require("path");

// Load environment variables
dotenv.config();
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_TOKEN = process.env.TMDB_TOKEN;

// Load genres from a JSON file once during initialization
const genresFilePath = path.join(__dirname, "genre.json");
let genres = [];

// Map category to language
let languageMap = {
  bollywood: "hi", // Hindi
  hollywood: "en", // English
  tollywood: "te", // Telugu
  kollywood: "ta", // Tamil
  mollywood: "ml", // Malayalam
  sandalwood: "kn", // Kannada
  japanese: "ja", //Japanese
  korean: "ko", //Korean
  anime: "16",
  marathi: "mr",
};

const loadGenres = () => {
  try {
    const data = fs.readFileSync(genresFilePath, "utf8");
    genres = JSON.parse(data).genres || [];
  } catch (error) {
    console.error("Error loading genres:", error.message);
    genres = [];
  }
};

loadGenres(); // Initialize genres

// Utility function to map genre IDs to names
const getGenreNames = (genreIds) => {
  return genreIds.map((id) => {
    const genre = genres.find((genre) => genre.id === id);
    return genre ? genre.name : "Unknown";
  });
};

module.exports = {
  fetchMoviesByCategory: async (req, res) => {
    try {
      const { category, year, name, page = 1 } = req.query;
      const limit = 20; // Limit to 20 items per page
      const offset = (page - 1) * limit;

      if (!category) {
        return res.status(400).json({ message: "Category is required." });
      }

      let tmdbUrl;

      // Handle Anime movies
      if (category.toLowerCase() === "anime") {
        if (name && year) {
          tmdbUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
            name
          )}&page=${page}&language=en-US&with_genres=16&primary_release_year=${year}`;
        } else if (name) {
          tmdbUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
            name
          )}&page=${page}&language=en-US&with_genres=16`;
        } else if (year) {
          tmdbUrl = `https://api.themoviedb.org/3/discover/movie?sort_by=release_date.desc&page=${page}&language=en-US&with_genres=16&primary_release_year=${year}`;
        } else {
          tmdbUrl = `https://api.themoviedb.org/3/discover/movie?sort_by=release_date.desc&page=${page}&language=en-US&with_genres=16`;
        }
      } else if (languageMap[category.toLowerCase()] && name) {
        tmdbUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
          name
        )}&page=${page}&language=en-US&with_original_language=${
          languageMap[category.toLowerCase()]
        }`;
      } else if (name) {
        tmdbUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
          name
        )}&page=${page}&language=en-US`;
      } else if (languageMap[category.toLowerCase()]) {
        tmdbUrl = `https://api.themoviedb.org/3/discover/movie?sort_by=release_date.desc&page=${page}&language=en-US&with_original_language=${
          languageMap[category.toLowerCase()]
        }`;
      }

      if (year && category.toLowerCase() !== "anime") {
        tmdbUrl += `&primary_release_year=${year}`;
      }

      const response = await fetch(tmdbUrl, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${TMDB_TOKEN}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          `TMDB API Error: ${response.status} - ${errorData.status_message}`
        );
        return res.status(response.status).json({
          message: `TMDB API Error: ${errorData.status_message}`,
        });
      }

      const tmdbData = await response.json();

      const movies = tmdbData.results.slice(0, limit).map((movie) => ({
        movieId: movie.id.toString(),
        title: movie.title,
        release_date: movie.release_date,
        category,
        downloadLinks: [],
        original_language: movie.original_language,
        overview: movie.overview,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        popularity: movie.popularity,
        vote_average: movie.vote_average,
        vote_count: movie.vote_count,
        genres: getGenreNames(movie.genre_ids),
      }));

      res.status(200).json({
        movies,
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(tmdbData.total_results / limit),
      });
    } catch (error) {
      console.error("Error fetching movies:", error.message);
      res.status(500).json({ message: "Error fetching movies." });
    }
  },

  fetchMovieById: async (req, res) => {
    try {
      const { id: movieId } = req.params;
      if (!movieId) {
        return res.status(400).json({ message: "Movie ID is required." });
      }

      const tmdbUrl = `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`;

      // Fetch movie details from TMDB using fetch API
      const response = await fetch(tmdbUrl, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${TMDB_TOKEN}`,
        },
      });

      // Check for errors from the TMDB API
      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          `TMDB API Error: ${response.status} - ${errorData.status_message}`
        );
        return res.status(response.status).json({
          message: `TMDB API Error: ${errorData.status_message}`,
        });
      }

      const movie = await response.json();

      const movieDetails = {
        movieId: movie.id.toString(),
        title: movie.title,
        release_date: movie.release_date,
        original_language: movie.original_language,
        overview: movie.overview,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        popularity: movie.popularity,
        vote_average: movie.vote_average,
        vote_count: movie.vote_count,
        genres: getGenreNames(movie.genres.map((genre) => genre.id)),
      };

      res.status(200).json(movieDetails);
    } catch (error) {
      console.error("Error fetching movie by ID:", error.message);
      res.status(500).json({ message: "Error fetching movie by ID." });
    }
  },

  fetchMovieByIdDB: async (req, res) => {
    try {
      const { id: movieId } = req.params;
      const movie = await Movie.findOne({ movieId });

      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }

      // Transform downloadLinks to extract the 'start=' part and the value that follows
      const transformedDownloadLinks = movie.downloadLinks.map((link) => {
        const startPart = link.link.split("start=")[1] || ""; // Extract the part after 'start='
        return {
          quality: link.quality, // Keep the quality as it is
          size: link.size, // Keep the size as it is
          link: startPart, // Replace the link with the extracted part
        };
      });

      // Return the movie with the transformed downloadLinks
      res.status(200).json({
        ...movie.toObject(),
        downloadLinks: transformedDownloadLinks,
      });
    } catch (error) {
      console.error("Error fetching movie from database:", error.message);
      res.status(500).json({ message: "Server error" });
    }
  },

  saveMovie: async (req, res) => {
    try {
      const { movieId, title, category, downloadLinks } = req.body;

      // Check if the movie already exists
      const existingMovie = await Movie.findOne({ movieId });
      if (existingMovie) {
        return res.status(400).json({ message: "Movie already exists." });
      }

      // Transform downloadLinks to include the desired URL structure
      const transformedDownloadLinks = downloadLinks.map((link) => ({
        ...link,
        link: `https://t.me/movie_mva_bot?start=${link.link}`,
      }));

      // Create a new movie with the transformed downloadLinks
      const newMovie = new Movie({
        movieId,
        title,
        category,
        downloadLinks: transformedDownloadLinks,
      });

      // Save the new movie to the database
      await newMovie.save();

      res.status(201).json({
        message: "Movie saved successfully.",
        movie: newMovie,
      });
    } catch (error) {
      console.error("Error saving movie:", error.message);
      res.status(500).json({ message: "Error saving movie." });
    }
  },

  updateMovie: async (req, res) => {
    try {
      const { id: movieId } = req.params;
      const { title, category, downloadLinks } = req.body;

      // Transform downloadLinks to include the desired URL structure
      const transformedDownloadLinks = downloadLinks.map((link) => ({
        ...link,
        link: `https://t.me/movie_mva_bot?start=${link.link}`,
      }));

      // Update the movie with the transformed downloadLinks
      const updatedMovie = await Movie.findOneAndUpdate(
        { movieId },
        { title, category, downloadLinks: transformedDownloadLinks },
        { new: true, runValidators: true }
      );

      if (!updatedMovie) {
        return res.status(404).json({ message: "Movie not found." });
      }

      res.status(200).json({
        message: "Movie updated successfully.",
        movie: updatedMovie,
      });
    } catch (error) {
      console.error("Error updating movie:", error.message);
      res.status(500).json({ message: "Error updating movie." });
    }
  },

  deleteMovie: async (req, res) => {
    try {
      const { id: movieId } = req.params;

      const deletedMovie = await Movie.findOneAndDelete({ movieId });
      if (!deletedMovie) {
        return res.status(404).json({ message: "Movie not found." });
      }

      res
        .status(200)
        .json({ message: "Movie deleted successfully.", movie: deletedMovie });
    } catch (error) {
      console.error("Error deleting movie:", error.message);
      res.status(500).json({ message: "Error deleting movie." });
    }
  },

  fetchMoviesByCategoryAndGenre: async (req, res) => {
    try {
      // Fetch all movies from the database without pagination
      const moviesFromDB = await Movie.find();

      if (moviesFromDB.length === 0) {
        return res
          .status(404)
          .json({ message: "No movies found in the database." });
      }

      // Fetch details from TMDB for each movie
      const tmdbMoviesDetails = await Promise.all(
        moviesFromDB.map(async (movie) => {
          try {
            const tmdbUrl = `https://api.themoviedb.org/3/movie/${movie.movieId}?language=en-US`;

            // Use fetch to get data from TMDB
            const response = await fetch(tmdbUrl, {
              method: "GET",
              headers: {
                accept: "application/json",
                Authorization: `Bearer ${TMDB_TOKEN}`,
              },
            });

            // Check if the response is valid
            if (!response.ok) {
              throw new Error(
                `TMDB API Error: ${response.status} - ${response.statusText}`
              );
            }

            const tmdbData = await response.json();

            // Match category based on languageMap
            const matchedCategory = Object.keys(languageMap).find(
              (category) => languageMap[category] === tmdbData.original_language
            );

            return {
              movieId: movie.movieId,
              title: tmdbData.title,
              release_date: tmdbData.release_date,
              category: matchedCategory || movie.category,
              original_language: tmdbData.original_language,
              overview: tmdbData.overview,
              poster_path: tmdbData.poster_path,
              backdrop_path: tmdbData.backdrop_path,
              popularity: tmdbData.popularity,
              vote_average: tmdbData.vote_average,
              vote_count: tmdbData.vote_count,
              genres: tmdbData.genres.map((genre) => genre.name),
              downloadLinks: movie.downloadLinks,
            };
          } catch (error) {
            console.error(
              `Error fetching TMDB data for movieId ${movie.movieId}:`,
              error.message
            );

            // Fallback response for errors during TMDB fetch
            return {
              movieId: movie.movieId,
              title: movie.title,
              release_date: movie.release_date,
              category: movie.category,
              original_language: movie.original_language,
              overview: movie.overview,
              poster_path: movie.poster_path,
              backdrop_path: movie.backdrop_path,
              popularity: 0,
              vote_average: 0,
              vote_count: 0,
              genres: movie.genres,
              downloadLinks: movie.downloadLinks,
            };
          }
        })
      );

      res.status(200).json({
        movies: tmdbMoviesDetails,
      });
    } catch (error) {
      console.error("Error fetching movies:", error.message);
      res.status(500).json({ message: "Error fetching movies." });
    }
  },
};
