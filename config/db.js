const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async (retries = 5, delay = 5000) => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    if (retries === 0) {
      console.error("Error connecting to MongoDB. No retries left.", error);
      return;
    }
    console.error(
      `Error connecting to MongoDB. Retrying in ${delay / 1000} seconds...`,
      error
    );
    setTimeout(() => connectDB(retries - 1, delay), delay);
  }
};

module.exports = connectDB;
