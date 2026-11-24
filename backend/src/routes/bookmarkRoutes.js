import express from "express";

import {
  addBookmark,
  removeBookmark,
  getBookmarks
} from "../controllers/bookmarkController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All bookmark routes require authentication
router.use(protect);

// Get all bookmarks
router.get("/", getBookmarks);

// Add a bookmark
router.post("/:propertyId", addBookmark);

// Remove a bookmark
router.delete("/:propertyId", removeBookmark);

export default router;