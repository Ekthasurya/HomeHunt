import express from "express";

import {
  createConversation,
  getConversations,
  getConversationMessages
} from "../controllers/conversationController.js";

import {
  sendMessage,
  markMessagesAsRead
} from "../controllers/messageController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All conversation routes require authentication
router.use(protect);

// Create or get a conversation
router.post("/", createConversation);

// Get logged-in user's conversations
router.get("/", getConversations);

// Get messages in a conversation
router.get("/:id/messages", getConversationMessages);

// Send a message
router.post("/:id/messages", sendMessage);

// Mark incoming messages as read
router.patch("/:id/read", markMessagesAsRead);

export default router;

