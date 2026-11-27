
import express from "express";

import {
  createReview,
  getPropertyReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Allow buyers only
const buyerOnly = (req, res, next) => {
  if (req.user.role !== "buyer") {
    return res.status(403).json({
      success: false,
      message: "Only buyers can manage property reviews",
    });
  }

  next();
};

// Public: Get reviews for a property
router.get("/property/:propertyId", getPropertyReviews);

// Buyer: Create a review
router.post(
  "/property/:propertyId",
  protect,
  buyerOnly,
  createReview
);

// Buyer: Update own review
router.patch(
  "/:reviewId",
  protect,
  buyerOnly,
  updateReview
);

// Buyer: Delete own review
router.delete(
  "/:reviewId",
  protect,
  buyerOnly,
  deleteReview
);

export default router;
