
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Star, Trash2, Pencil, X } from "lucide-react";

import {
  fetchPropertyReviews,
  addPropertyReview,
  editPropertyReview,
  removePropertyReview,
  clearReviews,
} from "../../app/slices/reviewSlice";

export default function ReviewSection({ propertyId }) {
  const dispatch = useDispatch();

  const {
    reviews,
    averageRating,
    totalReviews,
    loading,
    submitting,
    error,
  } = useSelector((state) => state.reviews);

  const { user, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);

  useEffect(() => {
    dispatch(fetchPropertyReviews(propertyId));

    return () => {
      dispatch(clearReviews());
    };
  }, [dispatch, propertyId]);

  const isBuyer = isAuthenticated && user?.role === "buyer";

  const ownReview = reviews.find(
    (review) => review.buyer?._id === user?._id
  );

  const resetForm = () => {
    setRating(0);
    setComment("");
    setEditingReviewId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating || comment.trim().length < 5) {
      return;
    }

    const reviewData = {
      rating,
      comment: comment.trim(),
    };

    try {
      if (editingReviewId) {
        await dispatch(
          editPropertyReview({
            reviewId: editingReviewId,
            reviewData,
          })
        ).unwrap();
      } else {
        await dispatch(
          addPropertyReview({
            propertyId,
            reviewData,
          })
        ).unwrap();
      }

      resetForm();
    } catch (error) {
      console.error("Review submission failed:", error);
    }
  };

  const handleEdit = (review) => {
    setEditingReviewId(review._id);
    setRating(review.rating);
    setComment(review.comment);
  };

  const handleDelete = async (reviewId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) return;

    try {
      await dispatch(removePropertyReview(reviewId)).unwrap();
    } catch (error) {
      console.error("Review deletion failed:", error);
    }
  };

  const renderStars = (value, interactive = false) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => setRating(star)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          aria-label={`Rate ${star} out of 5`}
        >
          <Star
            size={interactive ? 28 : 17}
            className={
              star <= (interactive ? hoverRating || value : value)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }
          />
        </button>
      ))}
    </div>
  );

  return (
    <section className="mt-12 border-t border-gray-200 pt-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Property Reviews
        </h2>

        <div className="mt-3 flex items-center gap-3">
          <span className="text-3xl font-bold text-gray-900">
            {averageRating.toFixed(1)}
          </span>

          {renderStars(Math.round(averageRating))}

          <span className="text-sm text-gray-500">
            ({totalReviews} reviews)
          </span>
        </div>
      </div>

      {/* REVIEW FORM */}
      {isBuyer && (
        <div className="mb-10 rounded-xl border border-gray-200 p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            {editingReviewId ? "Edit Your Review" : "Write a Review"}
          </h3>

          {ownReview && !editingReviewId && (
            <p className="mb-3 text-sm text-gray-500">
              You have already reviewed this property.
            </p>
          )}

          {(!ownReview || editingReviewId) && (
            <form onSubmit={handleSubmit}>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Your Rating
              </label>

              {renderStars(rating, true)}

              <label
                htmlFor="reviewComment"
                className="mb-2 mt-5 block text-sm font-medium text-gray-700"
              >
                Your Comment
              </label>

              <textarea
                id="reviewComment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience about this property..."
                rows={4}
                minLength={5}
                maxLength={1000}
                required
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !rating ||
                    comment.trim().length < 5
                  }
                  className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : editingReviewId
                    ? "Update Review"
                    : "Submit Review"}
                </button>

                {editingReviewId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2.5 text-gray-700 hover:bg-gray-50"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                )}
              </div>

              {error && (
                <p className="mt-3 text-sm text-red-600">{error}</p>
              )}
            </form>
          )}
        </div>
      )}

      {/* REVIEWS LIST */}
      <div className="space-y-5">
        {loading ? (
          <p className="py-6 text-center text-gray-500">
            Loading reviews...
          </p>
        ) : reviews.length === 0 ? (
          <p className="rounded-xl bg-gray-50 py-8 text-center text-gray-500">
            No reviews yet. Be the first to review this property.
          </p>
        ) : (
          reviews.map((review) => {
            const isOwnReview =
              review.buyer?._id === user?._id;

            return (
              <article
                key={review._id}
                className="rounded-xl border border-gray-200 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {review.buyer?.name || "Buyer"}
                    </h4>

                    <div className="mt-2">
                      {renderStars(review.rating)}
                    </div>
                  </div>

                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>

                <p className="mt-4 whitespace-pre-wrap text-gray-700">
                  {review.comment}
                </p>

                {isOwnReview && (
                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(review)}
                      className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(review._id)}
                      disabled={submitting}
                      className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
