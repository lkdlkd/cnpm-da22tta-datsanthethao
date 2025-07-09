const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Cấu hình lưu trữ file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Thư mục lưu ảnh
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// API upload ảnh
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Không có file nào được tải lên." });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ url: fileUrl });
});

module.exports = router;