
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      minlength: 5,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// One review per buyer for each property
reviewSchema.index(
  { property: 1, buyer: 1 },
  { unique: true }
);

// Efficient property review queries
reviewSchema.index({ property: 1, createdAt: -1 });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
