import express from "express";

import {
  createVisit,
  getMyVisits,
  updateVisitStatus,
  cancelVisit
} from "../controllers/visitController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Schedule a visit (Buyer only)
router.post(
  "/",
  protect,
  authorizeRoles("buyer"),
  createVisit
);

// Get logged-in user's visits
router.get(
  "/my-visits",
  protect,
  getMyVisits
);

// Update visit status (Agent/Admin)
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("agent", "admin"),
  updateVisitStatus
);

// Cancel a visit (Buyer only)
router.patch(
  "/:id/cancel",
  protect,
  authorizeRoles("buyer"),
  cancelVisit
);

export default router;