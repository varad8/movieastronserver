const axios = require("axios");
const Series = require("../models/Series");
const Category = require("../models/Category");
const dotenv = require("dotenv");

dotenv.config();

const addSeries = async (req, res) => {
  const { imdbID, category, downloadLinks } = req.body;
  try {
    const response = await axios.get(
      `https://www.omdbapi.com/?i=${imdbID}&apikey=${process.env.OMDB_API_KEY}`
    );
    if (response.data.Response === "False") {
      return res.status(404).send({ error: "Series not found." });
    }

    const seriesData = response.data;
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).send({ error: "Category not found." });
    }

    const series = new Series({
      title: seriesData.Title,
      year: seriesData.Year,
      rated: seriesData.Rated,
      released: seriesData.Released,
      runtime: seriesData.Runtime,
      genre: seriesData.Genre,
      director: seriesData.Director,
      writer: seriesData.Writer,
      actors: seriesData.Actors,
      plot: seriesData.Plot,
      language: seriesData.Language,
      country: seriesData.Country,
      awards: seriesData.Awards,
      poster: seriesData.Poster,
      imdbRating: seriesData.imdbRating,
      imdbVotes: seriesData.imdbVotes,
      imdbID: seriesData.imdbID,
      totalSeasons: seriesData.totalSeasons,
      category,
      downloadLinks,
    });

    await series.save();
    res.status(201).send({ message: "Series added successfully.", series });
  } catch (error) {
    res.status(400).send({ error: "Error adding series." });
  }
};

const getAllSeries = async (req, res) => {
  const { genre, category } = req.query;
  const filter = {};

  if (genre) {
    filter.genre = { $regex: genre, $options: "i" }; // Case-insensitive regex search
  }

  if (category) {
    filter.category = category;
  }

  try {
    const series = await Series.find(filter).populate("category");
    res.send(series);
  } catch (error) {
    res.status(400).send({ error: "Error fetching series." });
  }
};

const getSeriesById = async (req, res) => {
  const { id } = req.params;
  try {
    const series = await Series.findById(id).populate("category");
    if (!series) {
      return res.status(404).send({ error: "Series not found." });
    }
    res.send(series);
  } catch (error) {
    res.status(400).send({ error: "Error fetching series." });
  }
};

const updateSeries = async (req, res) => {
  const { id } = req.params;
  const { category, downloadLinks } = req.body;

  console.log(req.body);
  try {
    const series = await Series.findById(id);
    if (!series) {
      return res.status(404).send({ error: "Series not found." });
    }

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).send({ error: "Category not found." });
      }
      series.category = category;
    }

    if (downloadLinks) {
      series.downloadLinks = downloadLinks;
    }

    await series.save();
    res.send({ message: "Series updated successfully.", series });
  } catch (error) {
    res.status(400).send({ error: "Error updating series." });
  }
};

const deleteSeries = async (req, res) => {
  const { id } = req.params;
  try {
    const series = await Series.findByIdAndDelete(id);
    if (!series) {
      return res.status(404).send({ error: "Series not found." });
    }
    res.send({ message: "Series deleted successfully." });
  } catch (error) {
    res.status(400).send({ error: "Error deleting series." });
  }
};

module.exports = {
  addSeries,
  getAllSeries,
  getSeriesById,
  updateSeries,
  deleteSeries,
};
