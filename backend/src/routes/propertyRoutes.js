import express from "express";
import upload from "../middleware/uploadMiddleware.js";

import {
  protect,
  optionalProtect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

import {
  createProperty,
  getProperties,
  getManagedProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  uploadPropertyImages,
} from "../controllers/propertyController.js";



const router = express.Router();

// Public routes
router.get("/", getProperties);

// IMPORTANT: Keep /manage before /:id
router.get(
  "/manage",
  protect,
  authorizeRoles("agent", "admin"),
  getManagedProperties
);

// Property by ID
router.get("/:id", optionalProtect, getPropertyById);

// Protected property routes
router.post(
  "/upload-images",
  protect,
  authorizeRoles("agent", "admin"),
  upload.array("images", 10),
  uploadPropertyImages
);

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