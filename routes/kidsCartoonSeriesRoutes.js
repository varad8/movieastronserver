const express = require("express");
const {
  addKidsCartoonSeries,
  getAllKidsCartoonSeries,
  getKidsCartoonSeriesById,
  updateKidsCartoonSeries,
  deleteKidsCartoonSeries,
} = require("../controllers/kidsCartoonSeriesController");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/cartoons",
  authMiddleware,
  roleMiddleware(["admin"]),
  addKidsCartoonSeries
);
router.get("/cartoons", authMiddleware, getAllKidsCartoonSeries);
router.get("/cartoons/:id", authMiddleware, getKidsCartoonSeriesById);
router.put(
  "/cartoons/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateKidsCartoonSeries
);
router.delete(
  "/cartoons/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteKidsCartoonSeries
);

module.exports = router;
