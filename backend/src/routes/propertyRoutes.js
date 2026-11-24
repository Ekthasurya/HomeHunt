
import express from "express";

import upload from "../middleware/uploadMiddleware.js";
import { uploadPropertyImages } from "../controllers/propertyController.js";

import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty
} from "../controllers/propertyController.js";

import {
  protect,
  authorizeRoles
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getProperties);
router.get("/:id", getPropertyById);

router.post(
  "/upload-images",
  protect,
  authorizeRoles("agent", "admin"),
  upload.array("images", 10),
  uploadPropertyImages
);

// Protected routes
router.post(
  "/",
  protect,
  authorizeRoles("agent", "admin"),
  createProperty
);

router.patch(
  "/:id",
  protect,
  authorizeRoles("agent", "admin"),
  updateProperty
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("agent", "admin"),
  deleteProperty
);

export default router;
