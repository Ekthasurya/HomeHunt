
import mongoose from "mongoose";
import Review from "../models/Review.js";
import Property from "../models/Property.js";

// CREATE REVIEW
export const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { propertyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Rating and comment are required",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const existingReview = await Review.findOne({
      property: propertyId,
      buyer: req.user._id,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this property",
      });
    }

    const review = await Review.create({
      property: propertyId,
      buyer: req.user._id,
      rating,
      comment,
    });

    const populatedReview = await Review.findById(review._id)
      .populate("buyer", "name avatar");

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review: populatedReview,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this property",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET PROPERTY REVIEWS
export const getPropertyReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    const property = await Property.findById(propertyId).select("_id");

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const reviews = await Review.find({ property: propertyId })
      .populate("buyer", "name avatar")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews === 0
        ? 0
        : reviews.reduce((sum, review) => sum + review.rating, 0) /
          totalReviews;

    return res.status(200).json({
      success: true,
      totalReviews,
      averageRating: Number(averageRating.toFixed(1)),
      reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE OWN REVIEW
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    if (rating === undefined && comment === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide rating or comment to update",
      });
    }

    const review = await Review.findOne({
      _id: reviewId,
      buyer: req.user._id,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you are not authorized",
      });
    }

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate("buyer", "name avatar");

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review: updatedReview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE OWN REVIEW
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await Review.findOneAndDelete({
      _id: reviewId,
      buyer: req.user._id,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you are not authorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
