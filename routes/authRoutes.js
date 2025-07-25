const express = require("express");
const {
  signup,
  login,
  validateToken,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/validatetoken", validateToken);

module.exports = router;
