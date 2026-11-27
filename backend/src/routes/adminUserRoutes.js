
import express from "express";

import {
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getDeletedUsers,
  restoreUser,
} from "../controllers/adminUserController.js";

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

// Protect all admin user routes
router.use(protect, adminOnly);

// Get deleted users
router.get("/deleted", getDeletedUsers);

// Get all active/non-deleted users
router.get("/", getAllUsers);

// Restore deleted user
router.patch("/:userId/restore", restoreUser);

// Activate or deactivate user
router.patch("/:userId/status", updateUserStatus);

// Soft delete user
router.delete("/:userId", deleteUser);

export default router;
