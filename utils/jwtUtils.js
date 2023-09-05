const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

exports.generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, SECRET_KEY, { expiresIn: "7d" });
};

exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return error;
  }
};

