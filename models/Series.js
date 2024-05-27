const mongoose = require("mongoose");

const downloadLinkSchema = new mongoose.Schema({
  size: { type: String, required: true },
  link: { type: String, required: true },
  quality: { type: String, required: true },
});

const episodeSchema = new mongoose.Schema({
  ep: { type: Number, required: true },
  links: [downloadLinkSchema],
});

const seasonSchema = new mongoose.Schema({
  season: { type: Number, required: true },
  episodes: [episodeSchema],
});

const seriesSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    year: { type: String, required: true },
    rated: { type: String },
    released: { type: String, required: true },
    runtime: { type: String, required: true },
    genre: { type: String, required: true },
    director: { type: String },
    writer: { type: String, required: true },
    actors: { type: String, required: true },
    plot: { type: String, required: true },
    language: { type: String, required: true },
    country: { type: String, required: true },
    awards: { type: String },
    poster: { type: String, required: true },
    imdbRating: { type: String, required: true },
    imdbVotes: { type: String, required: true },
    imdbID: { type: String, required: true },
    totalSeasons: { type: Number, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    downloadLinks: [seasonSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Series", seriesSchema);
