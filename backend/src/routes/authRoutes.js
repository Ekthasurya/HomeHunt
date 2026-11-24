
import express from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateMe
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/me", protect, getMe);
router.patch("/me", protect, updateMe);

// Logout
router.post("/logout", logoutUser);

export default router;
