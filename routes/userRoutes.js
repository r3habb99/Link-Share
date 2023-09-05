const express = require("express");
const userController = require("../controllers/userController");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const router = express.Router();
const responseMessages = require("../Responses/responseMessages");

// Custom validation error handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const errorArray = errors.array().map((error) => error.msg);
  return res
    .status(400)
    .json(responseMessages.error(400, "Caught Validation error", errorArray));
};
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("gender").isIn(["M", "F"]).withMessage("Gender must be M or F"),
    body("email")
      .notEmpty()
      .isEmail()
      .withMessage("Invalid email")
      .normalizeEmail()
      .custom(async (value, { req }) => {
        const userDoc = await User.findOne({ email: value });
        if (userDoc) {
          return Promise.reject("Email already already exists in database");
        }
      }),
    body("password")
      .notEmpty()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  userController.registerUser
);

router.post("/login",[
  body('email').notEmpty().isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password').notEmpty().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], userController.loginUser);


router.get("/verify/:userId/:token", userController.verifyEmail);

module.exports = router;
