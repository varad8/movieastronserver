const express = require("express");
const {
  addSeries,
  getAllSeries,
  getSeriesById,
  updateSeries,
  deleteSeries,
} = require("../controllers/seriesController");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/series", authMiddleware, roleMiddleware(["admin"]), addSeries);
router.get("/series", authMiddleware, getAllSeries);
router.get("/series/:id", authMiddleware, getSeriesById);
router.put(
  "/series/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateSeries
);
router.delete(
  "/series/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteSeries
);

module.exports = router;
