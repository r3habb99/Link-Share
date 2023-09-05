const multer = require("multer");
const jwtUtils = require("../utils/jwtUtils");
const multerConfig = require("../utils/multerConfig");
const {
  transporter,
  singleMailOptions,
  MultipleMailOptions,
  sendDownloadLinkEmail,
} = require("../utils/nodemailerConfig");

require("dotenv").config();
const path = require("path");
const fs = require("fs");

const sharp = require("sharp");
const File = require("../models/file");
const User = require("../models/user");
const responseMessages = require("../Responses/responseMessages");

exports.getAllFiles = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  try {
    const totalItems = await File.find().countDocuments();
    const files = await File.find()
      .populate("uploader")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    res.status(200).json(
      responseMessages.success(200, "Your List of Files", {
        files: files,
        totalItems: totalItems,
      })
    );
  } catch (error) {
    console.error(error);
    res.status(500).json(responseMessages.error(500, "Error getting files"));
    next(err);
  }
};

exports.uploadMultipleFiles = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res
        .status(400)
        .json(responseMessages.error(400, "No multiple files uploaded"));
    }
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json(responseMessages.error(404, "User not found"));
    }

    const uploadedFiles = [];
    for (const file of files) {
      const filePath = path.join("uploads/image", file.filename);
      const newFile = new File({
        filename: file.filename,
        filePath: filePath,
        uploader: userId,
      });
      await newFile.save();

      uploadedFiles.push(newFile._id);

      // Check if the uploaded file is an image
      if (file.mimetype.startsWith("image")) {
        const inputFilePath = `uploads/image/${file.filename}`;
        const outputFilePath = `uploads/resized/${file.filename}`;
        const target = {
          width: 200,
          height: 200,
          fit: sharp.fit.cover,
          background: { r: 255, g: 255, b: 255, alpha: 0.5 },
        };

        await sharp(inputFilePath).resize(target).toFile(outputFilePath);
        newFile.resizedFilePath = outputFilePath;
        await newFile.save();
      }
    }
    if (uploadedFiles) {
      user.files = user.files.concat(uploadedFiles);
      await user.save();

      const mailOptions = MultipleMailOptions(uploadedFiles, user);
      transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
          console.log("Error sending email:", error);
        } else {
          console.log("Email sent:", info.response);
        }

        res.status(200).json(
          responseMessages.success(200, "Multiple Files stored successfully", {
            user: user.email,
            fileLinks: uploadedFiles.map((fileId) => {
              return `${process.env.BASE_URL}/files/${fileId}`;
            }),
            mailOptions,
          })
        );
      });
    } else {
      res.status(400).json(responseMessages.error(400, "No files uploaded"));
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(responseMessages.error(500, "Error uploading Files"));
  }
};

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(
        responseMessages.error(400, "No file uploaded", {
          file: "Must select file ",
        })
      );
    }
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json(responseMessages.error(404, "User not found"));
    }

    const newFile = new File({
      filename: req.file.filename,
      filePath: `uploads/image/${req.file.filename}`,
      uploader: userId,
    });
    await newFile.save();

    user.files.push(newFile._id);
    await user.save();

    if (req.file.mimetype.startsWith("image")) {
      const inputFilePath = `uploads/image/${req.file.filename}`;
      const outputFilePath = `uploads/resized/${req.file.filename}`;
      const target = {
        width: 200,
        height: 200,
        fit: sharp.fit.cover,
        background: { r: 255, g: 255, b: 255, alpha: 0.5 },
      };

      await sharp(inputFilePath).resize(target).toFile(outputFilePath);
      newFile.resizedFilePath = outputFilePath;
      await newFile.save();
    }

    const mailOptions = singleMailOptions(newFile, user);
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    return res.status(200).json(
      responseMessages.success(200, "File stored and resized successfully", {
        user: user.email,
        fileLink: `${process.env.BASE_URL}/files/${req.file.filename}`,
      })
    );
  } catch (error) {
    console.error(error);
    res.status(500).json(responseMessages.error(500, "Error Uploading File"));
  }
};

exports.getFile = async (req, res, next) => {
  const user = await User.findOne(req.body.email);
  const fileId = req.params.fileId;
  const file = await File.findById(fileId);
  try {
    if (!file) {
      return res
        .status(404)
        .json(responseMessages.error(404, "file not found"));
    }
    res.status(200).json(
      responseMessages.success(200, "Your Requested File", {
        file: file,
        filename: file.filename,
        uploader: user.email,
      })
    );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(responseMessages.error(500, "Error getting requested files"));
    next(error);
  }
};

exports.updateFile = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const existingFile = await File.findById(fileId);

    if (!existingFile) {
      return res
        .status(404)
        .json(responseMessages.error(404, "File not found"));
    }

    if (req.file) {
      existingFile.filename = req.file.filename;
      existingFile.filePath = req.file.path;
    }
    if (req.user) {
      existingFile.uploader = req.user._id;
    }
    if (req.file.mimetype.startsWith("image")) {
      const inputFilePath = `uploads/image/${req.file.filename}`;
      const outputFilePath = `uploads/resized/${req.file.filename}`;
      const target = {
        width: 200,
        height: 200,
        fit: sharp.fit.cover,
        background: { r: 255, g: 255, b: 255, alpha: 0.5 },
      };

      await sharp(inputFilePath).resize(target).toFile(outputFilePath);
      existingFile.resizedFilePath = outputFilePath;
      await existingFile.save();
    }

    return res.status(200).json(
      responseMessages.success(200, "File updated successfully", {
        file: existingFile,
      })
    );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(responseMessages.error(500, "Error getting requested files"));
  }
};

exports.getFileKey = async (req, res) => {
  try {
    let result = await File.find({
      $or: [{ filename: { $regex: req.params.key } }],
    });
    return res.status(200).json(
      responseMessages.success(200, "File Found successfully", {
        file: result,
      })
    );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(responseMessages.error(500, "Error getting requested files"));
  }
};

exports.deleteFile = async (req, res) => {
  const fileId = req.params.fileId;
  try {
    const fileToDelete = await File.findById(fileId);

    if (!fileToDelete) {
      return res
        .status(404)
        .json(responseMessages.error(404, "File not found"));
    }
    if (fileToDelete.uploader.toString() !== req.userId) {
      return res
        .status(403)
        .json(
          responseMessages.error(
            403,
            "You are not authorized to delete this file"
          )
        );
    }

    // Get the file path from the database
    const filePath = fileToDelete.filePath;

    // Get the user who uploaded the file
    const user = await User.findById(fileToDelete.uploader);

    const files = user.files.filter((file) => file.id !== fileId);
    user.files = files;

    // Update the user's file references in the database
    await user.save();

    // Delete the file from the database
    await File.findByIdAndDelete(fileId);

    return res
      .status(200)
      .json(
        responseMessages.success(200, "File deleted successfully", { filePath })
      );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(responseMessages.error(500, "Error getting requested files"));
  }
};
