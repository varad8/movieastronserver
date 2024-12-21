const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema(
  {
    movieId: { type: String, required: true, unique: true },
    downloadLinks: [
      {
        quality: { type: String, required: true },
        size: { type: String, required: true },
        link: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", MovieSchema);
