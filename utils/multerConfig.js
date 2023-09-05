const multer = require("multer");
const path = require("path");
const maxSize = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let destinationFolder = "uploads/";
    if (file.mimetype.startsWith("image")) {
      destinationFolder += "image/";
    } else if (file.mimetype === "application/pdf") {
      destinationFolder += "pdf/";
    } else if (file.mimetype === "application/msword") {
      destinationFolder += "docs/";
    } else {
      console.log("No files are matched with this extension");
    }
    cb(null, destinationFolder);
  },
  filename: (req, file, cb) => {
    const filename = new Date().toISOString() + "-" + file.originalname;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  // console.log(file);
  const allowedImageMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
    "application/msword",
  ];

  if (allowedImageMimeTypes.includes(file.mimetype)) {
    // console.log("exist");
    cb(null, true);
  } else {
    cb(new Error("Invalid file type or size"), false);
  }
};

module.exports = {
  storage,
  fileFilter,
  limits: { filesize: maxSize },
};
