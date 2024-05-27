// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// const dotenv = require("dotenv");

// dotenv.config();

// const authMiddleware = async (req, res, next) => {
//   const token = req.header("Authorization").replace("Bearer ", "");

//   if (!token) {
//     return res.status(401).send({ error: "Access denied. No token provided." });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id);
//     if (!req.user) {
//       return res.status(404).send({ error: "User not found." });
//     }
//     next();
//   } catch (ex) {
//     res.status(400).send({ error: "Invalid token." });
//   }
// };

// const roleMiddleware = (roles) => (req, res, next) => {
//   if (!roles.includes(req.user.role)) {
//     return res.status(403).send({ error: "Access denied." });
//   }
//   next();
// };

// module.exports = { authMiddleware, roleMiddleware };
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const dotenv = require("dotenv");

dotenv.config();

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ error: "Access denied. No token provided." });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(404).send({ error: "User not found." });
    }

    next();
  } catch (ex) {
    res.status(400).send({ error: "Invalid token." });
  }
};

const roleMiddleware = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).send({ error: "Access denied." });
  }
  next();
};

const secretMiddleware = (req, res, next) => {
  const secret = req.header("Authorization");

  if (!secret || !secret.startsWith("Bearer ")) {
    return res.status(401).send({ error: "Access denied." });
  }

  if (!secret || secret !== `Bearer ${process.env.CUSTOM_SECRET}`) {
    return res.status(401).send({ error: "Access denied." });
  }

  next();
};

module.exports = { authMiddleware, roleMiddleware, secretMiddleware };
