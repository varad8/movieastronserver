const express = require("express");
const {
  addCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
} = require("../controllers/categoryController");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/categories",
  authMiddleware,
  roleMiddleware(["admin"]),
  addCategory
);
router.put(
  "/categories/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateCategory
);
router.delete(
  "/categories/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteCategory
);
router.get(
  "/categories",
  authMiddleware,
  roleMiddleware(["admin"]),
  getAllCategories
);
router.get(
  "/categories/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  getCategoryById
);

module.exports = router;
