require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwtUtils = require("../utils/jwtUtils");
const User = require("../models/user");
const VerificationToken = require("../models/verifictionToken");
const responseMessages = require("../Responses/responseMessages");
const {
  transporter,
  successfulRegister,
} = require("../utils/nodemailerConfig");

require("dotenv").config();
const path = require("path");

exports.registerUser = async (req, res) => {
  const { name, gender, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email: email });

    // Hash the password and create a new user
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      name,
      gender,
      email,
      password: hashedPassword,
      active: false,
    });

    const token = jwtUtils.generateToken();
    const verificationToken = new VerificationToken({
      userId: user._id,
      token: token,
    });
    await verificationToken.save();

    const verificationLink = `${process.env.BASE_URL}/users/verify/${user._id}/${token}`;
    const mailOptions = successfulRegister(user, verificationLink);

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    // Save the user to the database and return a success message
    await user.save();
    res
      .status(201)
      .json(
        responseMessages.success(
          201,
          "User registered successfully. Please check your email for verification link.",
          { verificationLink, token }
        )
      );
  } catch (error) {
    console.error(error);
    res.status(500).json(responseMessages.error(500, "Error registering user"));
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json(responseMessages.error(401, "Invalid email Credentials"));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json(responseMessages.error(401, "Password does not matches"));
    }

    const token = jwtUtils.generateToken(user._id, email);
    res.status(200).json(
      responseMessages.success(200, "Current User logged in", {
        userId: user._id,
        email: email,
        token,
      })
    );
  } catch (error) {
    console.error(error);
    res.status(500).json(responseMessages.error(500, "Error registering user"));
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const userId = req.params.userId;
    const token = req.params.token;

    const verificationToken = await VerificationToken.findOneAndDelete({
      userId: userId,
      token: token,
    });

    if (!verificationToken) {
      return res
        .status(404)
        .json(
          responseMessages.error(404, "Invalid or expired verification link")
        );
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json(404, "Bad Request, User not found");
    }

    if (user.active) {
      return res.status(200).json(200, "User already verified");
    }

    user.active = true;
    await user.save();

    return res.status(200).json(
      responseMessages.success(200, "User verified successfully", {
        user: user,
      })
    );
  } catch (error) {
    console.error(error);
    res.status(500).json(responseMessages.error(500, "Error registering user"));
  }
};
