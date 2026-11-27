
import express from "express";

import { protect } from "../middleware/authMiddleware.js";

import {
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getDeletedUsers,
  restoreUser,
} from "../controllers/adminUserController.js";

const router = express.Router();

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin only.",
    });
  }

  next();
};

// All routes require admin authentication
router.use(protect, adminOnly);

// Get active/non-deleted users
router.get("/", getAllUsers);

// Get deleted users
router.get("/deleted", getDeletedUsers);

// Restore deleted user
router.patch("/:userId/restore", restoreUser);

// Update user status
router.patch("/:userId/status", updateUserStatus);

// Soft delete user
router.delete("/:userId", deleteUser);

export default router;
