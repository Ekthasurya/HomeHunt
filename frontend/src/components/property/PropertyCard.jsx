
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Heart,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Star,
} from "lucide-react";

import {
  createBookmark,
  deleteBookmark,
} from "../../app/slices/bookmarkSlice";

function PropertyCard({ property }) {
  const dispatch = useDispatch();

  const { bookmarks } = useSelector((state) => state.bookmarks);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const propertyId = property?._id;

  const isBookmarked = bookmarks.some((bookmark) => {
    const bookmarkedProperty =
      typeof bookmark.property === "object"
        ? bookmark.property?._id
        : bookmark.property;

    return bookmarkedProperty === propertyId;
  });

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !propertyId) return;

    try {
      if (isBookmarked) {
        await dispatch(deleteBookmark(propertyId)).unwrap();
      } else {
        await dispatch(createBookmark(propertyId)).unwrap();
      }
    } catch (error) {
      console.error("Bookmark error:", error);
    }
  };

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    }

    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    }

    return `₹${price?.toLocaleString("en-IN")}`;
  };

  const image =
    property.images?.[0]?.url ||
    "https://placehold.co/600x400?text=Property";

  // Property rating information
  const averageRating = Number(property.averageRating) || 0;
  const totalReviews = Number(property.totalReviews) || 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

      {/* Property Image */}
      <div className="relative h-56 overflow-hidden">
        <Link to={`/properties/${propertyId}`}>
          <img
            src={image}
            alt={property.title}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />
        </Link>

        {/* Listing Type */}
        <span className="absolute left-4 top-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
          {property.listingType === "rent" ? "For Rent" : "For Sale"}
        </span>

        {/* Bookmark Button */}
        <button
          type="button"
          onClick={handleBookmark}
          disabled={!isAuthenticated}
          title={
            !isAuthenticated
              ? "Login to save properties"
              : isBookmarked
                ? "Remove bookmark"
                : "Save property"
          }
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Heart
            size={20}
            className={
              isBookmarked
                ? "fill-red-500 text-red-500"
                : "text-gray-700"
            }
          />
        </button>
      </div>

      {/* Property Details */}
      <div className="p-5">

        <p className="text-xl font-bold text-blue-600">
          {formatPrice(property.price)}
          {property.listingType === "rent" && (
            <span className="text-sm font-normal text-gray-500">
              {" "}/ month
            </span>
          )}
        </p>

        <Link to={`/properties/${propertyId}`}>
          <h3 className="mt-2 line-clamp-1 text-lg font-semibold text-gray-900 hover:text-blue-600">
            {property.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-2 text-sm">
          {totalReviews > 0 ? (
            <>
              <div className="flex items-center gap-1">
                <Star
                  size={16}
                  className="fill-yellow-400 text-yellow-400"
                />
                <span className="font-semibold text-gray-800">
                  {averageRating.toFixed(1)}
                </span>
              </div>

              <span className="text-gray-500">
                ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
              </span>
            </>
          ) : (
            <span className="text-gray-400">
              No reviews yet
            </span>
          )}
        </div>

        <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
          <MapPin size={16} />
          {property.location?.city}, {property.location?.state}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-sm text-gray-600">

          <div className="flex items-center gap-1">
            <BedDouble size={17} />
            <span>{property.bedrooms || 0} Beds</span>
          </div>

          <div className="flex items-center gap-1">
            <Bath size={17} />
            <span>{property.bathrooms || 0} Baths</span>
          </div>

          <div className="flex items-center gap-1">
            <Maximize size={17} />
            <span>{property.area || 0} sqft</span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default PropertyCard;
