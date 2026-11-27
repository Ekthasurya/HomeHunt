import express from "express";

import { getAdminActivities } from "../controllers/adminActivityController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// GET ALL ADMIN ACTIVITIES
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getAdminActivities
);

export default router;