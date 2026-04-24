const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

let upload, uploadDoc;

if (useCloudinary) {
  const cloudinary = require("cloudinary").v2;
  const { CloudinaryStorage } = require("multer-storage-cloudinary");

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const imageStorage = new CloudinaryStorage({
    cloudinary,
    params: { folder: "crackncode/images", allowed_formats: ["jpg","jpeg","png","webp","gif"], transformation: [{ quality: "auto" }] },
  });

  const docStorage = new CloudinaryStorage({
    cloudinary,
    params: { folder: "crackncode/docs", allowed_formats: ["pdf","doc","docx"], resource_type: "raw" },
  });

  upload    = multer({ storage: imageStorage, limits: { fileSize: 5  * 1024 * 1024 } });
  uploadDoc = multer({ storage: docStorage,   limits: { fileSize: 20 * 1024 * 1024 } });

} else {
  // Local disk storage fallback
  const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, "../../public/uploads")),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, crypto.randomBytes(12).toString("hex") + ext);
    },
  });

  const imageFilter = (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext) ? cb(null, true) : cb(new Error("Only image files allowed"));
  };

  const docFilter = (req, file, cb) => {
    const allowed = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext) ? cb(null, true) : cb(new Error("Only PDF/DOC files allowed"));
  };

  upload    = multer({ storage: diskStorage, fileFilter: imageFilter, limits: { fileSize: 5  * 1024 * 1024 } });
  uploadDoc = multer({ storage: diskStorage, fileFilter: docFilter,   limits: { fileSize: 20 * 1024 * 1024 } });
}

module.exports = { upload, uploadDoc };
