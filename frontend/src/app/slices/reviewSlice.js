
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getPropertyReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../../services/api/reviewApi";

// FETCH PROPERTY REVIEWS
export const fetchPropertyReviews = createAsyncThunk(
  "reviews/fetchPropertyReviews",
  async (propertyId, { rejectWithValue }) => {
    try {
      return await getPropertyReviews(propertyId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch reviews"
      );
    }
  }
);

// CREATE REVIEW
export const addPropertyReview = createAsyncThunk(
  "reviews/addPropertyReview",
  async ({ propertyId, reviewData }, { rejectWithValue }) => {
    try {
      return await createReview(propertyId, reviewData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit review"
      );
    }
  }
);

// UPDATE REVIEW
export const editPropertyReview = createAsyncThunk(
  "reviews/editPropertyReview",
  async ({ reviewId, reviewData }, { rejectWithValue }) => {
    try {
      return await updateReview(reviewId, reviewData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update review"
      );
    }
  }
);

// DELETE REVIEW
export const removePropertyReview = createAsyncThunk(
  "reviews/removePropertyReview",
  async (reviewId, { rejectWithValue }) => {
    try {
      await deleteReview(reviewId);
      return reviewId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete review"
      );
    }
  }
);

const initialState = {
  reviews: [],
  averageRating: 0,
  totalReviews: 0,
  loading: false,
  submitting: false,
  error: null,
};

const reviewSlice = createSlice({
  name: "reviews",
  initialState,

  reducers: {
    clearReviewError: (state) => {
      state.error = null;
    },

    clearReviews: (state) => {
      state.reviews = [];
      state.averageRating = 0;
      state.totalReviews = 0;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // FETCH REVIEWS
      .addCase(fetchPropertyReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertyReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.reviews;
        state.averageRating = action.payload.averageRating;
        state.totalReviews = action.payload.totalReviews;
      })
      .addCase(fetchPropertyReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CREATE REVIEW
      .addCase(addPropertyReview.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(addPropertyReview.fulfilled, (state, action) => {
        state.submitting = false;
        state.reviews.unshift(action.payload.review);
        state.totalReviews += 1;

        const totalRating = state.reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );

        state.averageRating = Number(
          (totalRating / state.totalReviews).toFixed(1)
        );
      })
      .addCase(addPropertyReview.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // UPDATE REVIEW
      .addCase(editPropertyReview.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(editPropertyReview.fulfilled, (state, action) => {
        state.submitting = false;

        const updatedReview = action.payload.review;

        state.reviews = state.reviews.map((review) =>
          review._id === updatedReview._id
            ? updatedReview
            : review
        );

        const totalRating = state.reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );

        state.averageRating =
          state.totalReviews === 0
            ? 0
            : Number(
                (totalRating / state.totalReviews).toFixed(1)
              );
      })
      .addCase(editPropertyReview.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // DELETE REVIEW
      .addCase(removePropertyReview.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(removePropertyReview.fulfilled, (state, action) => {
        state.submitting = false;

        state.reviews = state.reviews.filter(
          (review) => review._id !== action.payload
        );

        state.totalReviews = Math.max(0, state.totalReviews - 1);

        const totalRating = state.reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );

        state.averageRating =
          state.totalReviews === 0
            ? 0
            : Number(
                (totalRating / state.totalReviews).toFixed(1)
              );
      })
      .addCase(removePropertyReview.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearReviewError,
  clearReviews,
} = reviewSlice.actions;

export default reviewSlice.reducer;
