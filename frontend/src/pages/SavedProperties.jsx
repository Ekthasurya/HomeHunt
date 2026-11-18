
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

const initialBookmarks = [
  {
    id: "1",
    title: "Luxury Modern Apartment",
    location: "New Town, Kolkata",
    price: 8500000,
    type: "Apartment",
    bedrooms: 3,
    bathrooms: 2,
    area: 1450,
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900",
  },
  {
    id: "2",
    title: "Beautiful Family Villa",
    location: "Salt Lake, Kolkata",
    price: 12500000,
    type: "Villa",
    bedrooms: 4,
    bathrooms: 3,
    area: 2200,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900",
  },
  {
    id: "3",
    title: "Premium City Apartment",
    location: "Rajarhat, Kolkata",
    price: 6200000,
    type: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    area: 1100,
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=900",
  },
];

const formatPrice = (price) =>
  `₹${(price / 100000).toFixed(1)} Lac`;

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const filteredBookmarks = useMemo(() => {
    let result = bookmarks.filter((property) => {
      const matchesSearch =
        property.title.toLowerCase().includes(search.toLowerCase()) ||
        property.location.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        typeFilter === "All" || property.type === typeFilter;

      return matchesSearch && matchesType;
    });

    if (sortBy === "low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "high") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [bookmarks, search, typeFilter, sortBy]);

  const removeBookmark = (id) => {
    setBookmarks((previous) =>
      previous.filter((property) => property.id !== id)
    );
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
              {bookmarks.length} Saved
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
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="House">House</option>
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

        {/* Property Grid */}
        {filteredBookmarks.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBookmarks.map((property) => (
              <div
                key={property.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="group relative h-56 overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                    {property.type}
                  </span>

                  <button
                    onClick={() => removeBookmark(property.id)}
                    title="Remove bookmark"
                    className="absolute right-4 top-4 rounded-full bg-white p-2 text-red-500 shadow transition hover:bg-red-50"
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
                    {property.location}
                  </p>

                  <div className="mb-5 flex flex-wrap items-center gap-4 border-y border-gray-100 py-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <BedDouble size={17} />
                      {property.bedrooms} Beds
                    </span>

                    <span className="flex items-center gap-1">
                      <Bath size={17} />
                      {property.bathrooms} Baths
                    </span>

                    <span className="flex items-center gap-1">
                      <Maximize size={17} />
                      {property.area} sqft
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <Link
                      to={`/properties/${property.id}`}
                      className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      View Property
                    </Link>

                    <button
                      onClick={() => removeBookmark(property.id)}
                      className="rounded-xl border border-gray-200 p-3 text-gray-500 transition hover:border-red-200 hover:text-red-500"
                      title="Remove from bookmarks"
                    >
                      <Heart size={19} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
              {bookmarks.length === 0 ? (
                <Bookmark size={36} className="text-blue-600" />
              ) : (
                <Search size={36} className="text-blue-600" />
              )}
            </div>

            <h2 className="mb-2 text-xl font-bold text-gray-900">
              {bookmarks.length === 0
                ? "No saved properties yet"
                : "No properties found"}
            </h2>

            <p className="mx-auto mb-6 max-w-md text-gray-500">
              {bookmarks.length === 0
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
