
import express from "express";

import {
  exportUsersReport,
  exportPropertiesReport,
  exportVisitsReport,
  exportReviewsReport,
} from "../controllers/adminReportController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// All report routes require admin authentication
router.use(protect);
router.use(authorizeRoles("admin"));

// Export Users Report
router.get("/users", exportUsersReport);

// Export Properties Report
router.get("/properties", exportPropertiesReport);

// Export Visits Report
router.get("/visits", exportVisitsReport);

// Export Reviews Report
router.get("/reviews", exportReviewsReport);

export default router;
