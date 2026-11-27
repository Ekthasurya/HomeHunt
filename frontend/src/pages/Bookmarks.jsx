
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  Heart,
  Search,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Trash2,
  ArrowUpDown,
  Home,
  Bookmark,
} from "lucide-react";

import {
  fetchBookmarks,
  deleteBookmark,
} from "../app/slices/bookmarkSlice";

const formatPrice = (price) => {
  const amount = Number(price) || 0;

  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }

  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} Lac`;
  }

  return `₹${amount.toLocaleString("en-IN")}`;
};

export default function Bookmarks() {
  const dispatch = useDispatch();

  const {
    bookmarks = [],
    loading,
    error,
  } = useSelector((state) => state.bookmarks);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [removingId, setRemovingId] = useState(null);

  // Fetch bookmarks from backend
  useEffect(() => {
    dispatch(fetchBookmarks());
  }, [dispatch]);

  // Get actual property from bookmark
  const savedProperties = useMemo(() => {
    return bookmarks
      .map((bookmark) => {
        const property = bookmark.property;

        if (!property || typeof property !== "object") {
          return null;
        }

        return {
          ...property,
          bookmarkId: bookmark._id,
        };
      })
      .filter(Boolean);
  }, [bookmarks]);

  // Search, filter and sort
  const filteredBookmarks = useMemo(() => {
    let result = savedProperties.filter((property) => {
      const title = property.title || "";
      const city = property.location?.city || "";
      const address = property.location?.address || "";
      const type = property.propertyType || "";

      const matchesSearch =
        title.toLowerCase().includes(search.toLowerCase()) ||
        city.toLowerCase().includes(search.toLowerCase()) ||
        address.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        typeFilter === "All" ||
        type.toLowerCase() === typeFilter.toLowerCase();

      return matchesSearch && matchesType;
    });

    if (sortBy === "low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "high") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [savedProperties, search, typeFilter, sortBy]);

  // Remove bookmark through backend
  const handleRemoveBookmark = async (propertyId) => {
    try {
      setRemovingId(propertyId);

      await dispatch(deleteBookmark(propertyId)).unwrap();
    } catch (error) {
      console.error("Remove bookmark error:", error);
      alert(error || "Unable to remove bookmark.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <Link to="/" className="hover:text-blue-600">
                Home
              </Link>
              <span>/</span>
              <span>Bookmarks</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Saved Properties
            </h1>

            <p className="mt-2 text-gray-500">
              Keep track of the properties you love.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-sm">
            <Heart className="text-red-500" size={20} />
            <span className="font-semibold text-gray-800">
              {savedProperties.length} Saved
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 grid gap-4 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-3">

          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={19}
            />

            <input
              type="text"
              placeholder="Search saved properties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="All">All Property Types</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="house">House</option>
            <option value="plot">Plot</option>
            <option value="commercial">Commercial</option>
          </select>

          <div className="relative">
            <ArrowUpDown
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500"
            >
              <option value="newest">Recently Saved</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-16 text-center text-gray-500">
            Loading your saved properties...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl bg-red-50 p-5 text-center text-red-600">
            {typeof error === "string"
              ? error
              : "Unable to load saved properties. Please try again."}
          </div>
        )}

        {/* Property Grid */}
        {!loading && !error && filteredBookmarks.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBookmarks.map((property) => {
              const image =
                property.images?.[0]?.url ||
                property.images?.[0] ||
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900";

              const location = [
                property.location?.city,
                property.location?.state,
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <div
                  key={property._id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="group relative h-56 overflow-hidden">
                    <img
                      src={image}
                      alt={property.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-gray-700">
                      {property.propertyType}
                    </span>

                    <button
                      onClick={() =>
                        handleRemoveBookmark(property._id)
                      }
                      disabled={removingId === property._id}
                      title="Remove bookmark"
                      className="absolute right-4 top-4 rounded-full bg-white p-2 text-red-500 shadow transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="p-5">
                    <p className="mb-2 text-xl font-bold text-blue-600">
                      {formatPrice(property.price)}
                    </p>

                    <h2 className="mb-2 text-lg font-semibold text-gray-900">
                      {property.title}
                    </h2>

                    <p className="mb-5 flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={16} />
                      {location || property.location?.address || "Location unavailable"}
                    </p>

                    <div className="mb-5 flex flex-wrap items-center gap-4 border-y border-gray-100 py-4 text-sm text-gray-600">

                      <span className="flex items-center gap-1">
                        <BedDouble size={17} />
                        {property.bedrooms ?? 0} Beds
                      </span>

                      <span className="flex items-center gap-1">
                        <Bath size={17} />
                        {property.bathrooms ?? 0} Baths
                      </span>

                      <span className="flex items-center gap-1">
                        <Maximize size={17} />
                        {property.area ?? 0} {property.areaUnit || "sqft"}
                      </span>

                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <Link
                        to={`/properties/${property._id}`}
                        className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        View Property
                      </Link>

                      <button
                        onClick={() =>
                          handleRemoveBookmark(property._id)
                        }
                        disabled={removingId === property._id}
                        className="rounded-xl border border-gray-200 p-3 text-gray-500 transition hover:border-red-200 hover:text-red-500 disabled:opacity-50"
                        title="Remove from bookmarks"
                      >
                        <Heart size={19} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredBookmarks.length === 0 && (
          <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
              {savedProperties.length === 0 ? (
                <Bookmark size={36} className="text-blue-600" />
              ) : (
                <Search size={36} className="text-blue-600" />
              )}
            </div>

            <h2 className="mb-2 text-xl font-bold text-gray-900">
              {savedProperties.length === 0
                ? "No saved properties yet"
                : "No properties found"}
            </h2>

            <p className="mx-auto mb-6 max-w-md text-gray-500">
              {savedProperties.length === 0
                ? "Explore properties and save your favourites here."
                : "Try changing your search or property type filter."}
            </p>

            <Link
              to="/properties"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              <Home size={18} />
              Explore Properties
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
