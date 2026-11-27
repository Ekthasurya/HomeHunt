
import api from "./axios";

// Get reviews for a property
export const getPropertyReviews = async (propertyId) => {
  const response = await api.get(
    `/reviews/property/${propertyId}`
  );

  return response.data;
};

// Create a review
export const createReview = async (propertyId, reviewData) => {
  const response = await api.post(
    `/reviews/property/${propertyId}`,
    reviewData
  );

  return response.data;
};

// Update own review
export const updateReview = async (reviewId, reviewData) => {
  const response = await api.patch(
    `/reviews/${reviewId}`,
    reviewData
  );

  return response.data;
};

// Delete own review
export const deleteReview = async (reviewId) => {
  const response = await api.delete(
    `/reviews/${reviewId}`
  );

  return response.data;
};
