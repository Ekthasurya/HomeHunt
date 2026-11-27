
import express from "express";

import {
  getAllAdminProperties,
  updatePropertyApproval,
  updatePropertyVerification,
  updatePropertyStatus,
  updatePropertyFeatured,
} from "../controllers/adminPropertyController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin only.",
    });
  }

  next();
};

// Protect all admin property routes
router.use(protect, adminOnly);

// Get all properties
router.get("/", getAllAdminProperties);

// Approve or reject property
router.patch("/:propertyId/approval", updatePropertyApproval);

// Verify or unverify property
router.patch("/:propertyId/verification", updatePropertyVerification);

// Update availability status
router.patch("/:propertyId/status", updatePropertyStatus);

// Feature or unfeature property
router.patch("/:propertyId/featured", updatePropertyFeatured);

export default router;
