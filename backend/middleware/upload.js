const multer = require("multer");
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

const upload    = multer({ storage: imageStorage, limits: { fileSize: 5  * 1024 * 1024 } });
const uploadDoc = multer({ storage: docStorage,   limits: { fileSize: 20 * 1024 * 1024 } });

module.exports = { upload, uploadDoc };
