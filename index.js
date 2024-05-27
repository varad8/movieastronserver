const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const movieRoutes = require("./routes/movieRoutes");
const seriesRoutes = require("./routes/seriesRoutes");
const kidsCartoonSeriesRoutes = require("./routes/kidsCartoonSeriesRoutes");
const userRoutes = require("./routes/userRoutes");
const {
  authMiddleware,
  roleMiddleware,
} = require("./middlewares/authMiddleware");

const app = express();

connectDB();

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);

app.use("/api/admin", categoryRoutes);

app.use("/api/admin", movieRoutes);

app.use("/api/admin", seriesRoutes);

app.use("/api/admin", kidsCartoonSeriesRoutes);

app.use("/api/user", userRoutes);

app.get("/api/protected", authMiddleware, (req, res) => {
  res.send("This is a protected route");
});

app.get("/api/admin", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
  res.send("This is an admin route");
});

app.get("/", (req, res) => {
  res.send("Hello Im Server");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
