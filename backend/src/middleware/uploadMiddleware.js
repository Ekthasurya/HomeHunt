
import multer from "multer";

// Store uploaded files temporarily in memory
const storage = multer.memoryStorage();

// Allowed image MIME types
const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const upload = multer({
  storage,

  // Upload limits
  limits: {
    fileSize: 10 * 1024 * 1024, // 5 MB per image
    files: 10,                 // Maximum 10 images
  },

  // Validate image type
  fileFilter: (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(
      new Error("Only JPG, PNG and WEBP images are allowed")
    );
  },
});

export default upload;
