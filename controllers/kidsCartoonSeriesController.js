const axios = require("axios");
const KidsCartoonSeries = require("../models/KidsCartoonSeries");
const Category = require("../models/Category");
const dotenv = require("dotenv");

dotenv.config();

const addKidsCartoonSeries = async (req, res) => {
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

    const kidsCartoonSeries = new KidsCartoonSeries({
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

    await kidsCartoonSeries.save();
    res.status(201).send({
      message: "Kids cartoon series added successfully.",
      kidsCartoonSeries,
    });
  } catch (error) {
    res.status(400).send({ error: "Error adding kids cartoon series." });
  }
};

const getAllKidsCartoonSeries = async (req, res) => {
  const { genre, category } = req.query;
  const filter = {};

  if (genre) {
    filter.genre = { $regex: genre, $options: "i" }; // Case-insensitive regex search
  }

  if (category) {
    filter.category = category;
  }

  try {
    const kidscartoons = await KidsCartoonSeries.find(filter).populate(
      "category"
    );
    res.send(kidscartoons);
  } catch (error) {
    res.status(400).send({ error: "Error fetching cartoon series." });
  }
};

const getKidsCartoonSeriesById = async (req, res) => {
  const { id } = req.params;
  try {
    const kidsCartoonSeries = await KidsCartoonSeries.findById(id).populate(
      "category"
    );
    if (!kidsCartoonSeries) {
      return res.status(404).send({ error: "Kids cartoon series not found." });
    }
    res.send(kidsCartoonSeries);
  } catch (error) {
    res.status(400).send({ error: "Error fetching kids cartoon series." });
  }
};

const updateKidsCartoonSeries = async (req, res) => {
  const { id } = req.params;
  const { category, downloadLinks } = req.body;
  try {
    const kidsCartoonSeries = await KidsCartoonSeries.findById(id);
    if (!kidsCartoonSeries) {
      return res.status(404).send({ error: "Kids cartoon series not found." });
    }

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).send({ error: "Category not found." });
      }
      kidsCartoonSeries.category = category;
    }

    if (downloadLinks) {
      kidsCartoonSeries.downloadLinks = downloadLinks;
    }

    await kidsCartoonSeries.save();
    res.send({
      message: "Kids cartoon series updated successfully.",
      kidsCartoonSeries,
    });
  } catch (error) {
    res.status(400).send({ error: "Error updating kids cartoon series." });
  }
};

const deleteKidsCartoonSeries = async (req, res) => {
  const { id } = req.params;
  try {
    const kidsCartoonSeries = await KidsCartoonSeries.findByIdAndDelete(id);
    if (!kidsCartoonSeries) {
      return res.status(404).send({ error: "Kids cartoon series not found." });
    }
    res.send({ message: "Kids cartoon series deleted successfully." });
  } catch (error) {
    res.status(400).send({ error: "Error deleting kids cartoon series." });
  }
};

module.exports = {
  addKidsCartoonSeries,
  getAllKidsCartoonSeries,
  getKidsCartoonSeriesById,
  updateKidsCartoonSeries,
  deleteKidsCartoonSeries,
};
