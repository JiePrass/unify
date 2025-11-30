const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Folder mapping khusus Unify
function getCloudinaryFolder(fieldname) {
    switch (fieldname) {
        case "profilePicture":
            return "unify/profiles";

        case "helpMedia":
            return "unify/help-media";

        case "helpProof":
            return "unify/proof";

        case "reportFile":
            return "unify/reports";

        case "badgeIcon":
            return "unify/badges";

        case "missionBanner":
            return "unify/missions";

        default:
            return "unify/misc";
    }
}

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: getCloudinaryFolder(file.fieldname),
        allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf", "mp4"],
        public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,

        resource_type:
            file.mimetype.startsWith("video/")
                ? "video"
                : file.mimetype === "application/pdf"
                ? "raw"
                : "image",
    }),
});

const upload = multer({ storage });

module.exports = upload;
