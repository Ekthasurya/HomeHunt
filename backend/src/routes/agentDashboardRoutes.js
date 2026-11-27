
import express from "express";

import { getAgentDashboard } from "../controllers/agentDashboardController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Only logged-in agents can access their dashboard
router.get(
  "/",
  protect,
  authorizeRoles("agent"),
  getAgentDashboard
);

export default router;
