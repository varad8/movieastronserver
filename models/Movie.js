const mongoose = require("mongoose");

const downloadLinkSchema = new mongoose.Schema({
  size: { type: String, required: true },
  link: { type: String, required: true },
  quality: { type: String, required: true },
});

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    year: { type: String, required: true },
    rated: { type: String, required: true },
    released: { type: String, required: true },
    runtime: { type: String, required: true },
    genre: { type: String, required: true },
    director: { type: String, required: true },
    writer: { type: String, required: true },
    actors: { type: String, required: true },
    plot: { type: String, required: true },
    language: { type: String, required: true },
    country: { type: String, required: true },
    awards: { type: String, required: true },
    poster: { type: String, required: true },
    imdbRating: { type: String, required: true },
    imdbVotes: { type: String, required: true },
    imdbID: { type: String, required: true },
    boxOffice: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    downloadLinks: [downloadLinkSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
