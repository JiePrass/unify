// middlewares/uploadLocal.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, "../uploads/zips");
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
});

const uploadLocal = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== "application/zip" && file.mimetype !== "application/x-zip-compressed") {
        return cb(new Error("Hanya file ZIP yang diperbolehkan"));
        }
        cb(null, true);
    },
});

module.exports = uploadLocal;
