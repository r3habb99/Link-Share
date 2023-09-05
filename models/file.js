const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    filePath: { type: String, required: true },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("File", fileSchema);
