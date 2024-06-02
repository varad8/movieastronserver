const axios = require("axios");
const Movie = require("../models/Movie");
const Category = require("../models/Category");
const dotenv = require("dotenv");

dotenv.config();

const addMovie = async (req, res) => {
  const { imdbID, category, downloadLinks } = req.body;
  try {
    if (!imdbID || !category || !downloadLinks) {
      return res.status(400).send({ error: "fields cant be blank" });
    }

    const response = await axios.get(
      `https://www.omdbapi.com/?i=${imdbID}&apikey=${process.env.OMDB_API_KEY}`
    );
    if (response.data.Response === "False") {
      return res.status(404).send({ error: "Movie not found." });
    }

    const movieData = response.data;
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).send({ error: "Category not found." });
    }

    const movie = new Movie({
      title: movieData.Title,
      year: movieData.Year,
      rated: movieData.Rated,
      released: movieData.Released,
      runtime: movieData.Runtime,
      genre: movieData.Genre,
      director: movieData.Director,
      writer: movieData.Writer,
      actors: movieData.Actors,
      plot: movieData.Plot,
      language: movieData.Language,
      country: movieData.Country,
      awards: movieData.Awards,
      poster: movieData.Poster,
      imdbRating: movieData.imdbRating,
      imdbVotes: movieData.imdbVotes,
      imdbID: movieData.imdbID,
      boxOffice: movieData.BoxOffice,
      category,
      downloadLinks,
    });

    await movie.save();
    res.status(201).send({ message: "Movie added successfully.", movie });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Error adding movie." });
  }
};

const getAllMovies = async (req, res) => {
  const { genre, category } = req.query;
  const filter = {};

  if (genre) {
    filter.genre = { $regex: genre, $options: "i" }; // Case-insensitive regex search
  }

  if (category) {
    filter.category = category;
  }

  try {
    const movies = await Movie.find(filter).populate("category");
    res.send(movies);
  } catch (error) {
    res.status(400).send({ error: "Error fetching movies." });
  }
};

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

const updateMovie = async (req, res) => {
  const { id } = req.params;
  const { category, downloadLinks } = req.body;
  try {
    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).send({ error: "Movie not found." });
    }

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).send({ error: "Category not found." });
      }
      movie.category = category;
    }

    if (downloadLinks) {
      movie.downloadLinks = downloadLinks;
    }

    await movie.save();
    res.send({ message: "Movie updated successfully.", movie });
  } catch (error) {
    res.status(400).send({ error: "Error updating movie." });
  }
};

const deleteMovie = async (req, res) => {
  const { id } = req.params;
  try {
    const movie = await Movie.findByIdAndDelete(id);
    if (!movie) {
      return res.status(404).send({ error: "Movie not found." });
    }
    res.send({ message: "Movie deleted successfully." });
  } catch (error) {
    res.status(400).send({ error: "Error deleting movie." });
  }
};

module.exports = {
  addMovie,
  getAllMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
};
