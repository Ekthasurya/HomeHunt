import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Heart,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

// Sample property data
const propertyData = [
  {
    id: 1,
    title: "Modern Family Villa",
    location: "New Town, Kolkata",
    city: "Kolkata",
    price: 85,
    priceLabel: "₹85 Lac",
    purpose: "buy",
    propertyType: "Villa",
    bedrooms: 4,
    bathrooms: 3,
    area: 2400,
    date: "2026-11-15",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 2,
    title: "Luxury Apartment",
    location: "Salt Lake, Kolkata",
    city: "Kolkata",
    price: 0.35,
    priceLabel: "₹35,000/month",
    purpose: "rent",
    propertyType: "Apartment",
    bedrooms: 3,
    bathrooms: 2,
    area: 1650,
    date: "2026-11-14",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 3,
    title: "Premium Modern House",
    location: "Rajarhat, Kolkata",
    city: "Kolkata",
    price: 120,
    priceLabel: "₹1.2 Cr",
    purpose: "buy",
    propertyType: "House",
    bedrooms: 4,
    bathrooms: 4,
    area: 2800,
    date: "2026-11-13",
    image:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 4,
    title: "Elegant City Apartment",
    location: "Andheri, Mumbai",
    city: "Mumbai",
    price: 95,
    priceLabel: "₹95 Lac",
    purpose: "buy",
    propertyType: "Apartment",
    bedrooms: 3,
    bathrooms: 2,
    area: 1450,
    date: "2026-11-12",
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 5,
    title: "Contemporary Family Home",
    location: "Whitefield, Bengaluru",
    city: "Bengaluru",
    price: 45000,
    priceLabel: "₹45,000/month",
    purpose: "rent",
    propertyType: "House",
    bedrooms: 3,
    bathrooms: 3,
    area: 2100,
    date: "2026-11-11",
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 6,
    title: "Spacious Luxury Villa",
    location: "Rajarhat, Kolkata",
    city: "Kolkata",
    price: 175,
    priceLabel: "₹1.75 Cr",
    purpose: "buy",
    propertyType: "Villa",
    bedrooms: 5,
    bathrooms: 4,
    area: 3200,
    date: "2026-11-10",
    image:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 7,
    title: "Affordable City Apartment",
    location: "Dwarka, Delhi",
    city: "Delhi",
    price: 45,
    priceLabel: "₹45 Lac",
    purpose: "buy",
    propertyType: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    area: 1100,
    date: "2026-11-09",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 8,
    title: "Premium Rental Apartment",
    location: "New Town, Kolkata",
    city: "Kolkata",
    price: 28000,
    priceLabel: "₹28,000/month",
    purpose: "rent",
    propertyType: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    area: 1250,
    date: "2026-11-08",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 9,
    title: "Independent Designer House",
    location: "South Kolkata, Kolkata",
    city: "Kolkata",
    price: 110,
    priceLabel: "₹1.1 Cr",
    purpose: "buy",
    propertyType: "House",
    bedrooms: 4,
    bathrooms: 3,
    area: 2600,
    date: "2026-11-07",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85",
  },
];

const ITEMS_PER_PAGE = 6;

function getInitialBudget(value) {
  const budgets = {
    "Under 25 Lac": "under25",
    "25 Lac - 50 Lac": "25to50",
    "50 Lac - 1 Cr": "50to100",
    "Above 1 Cr": "above100",
  };

  return budgets[value] || "all";
}

export default function Properties() {
  const [searchParams] = useSearchParams();

  const [location, setLocation] = useState(searchParams.get("location") || "");

  const [purpose, setPurpose] = useState(searchParams.get("purpose") || "all");

  const [propertyType, setPropertyType] = useState(
    searchParams.get("propertyType") || "Any Property",
  );

  const [budget, setBudget] = useState(
    getInitialBudget(searchParams.get("budget")),
  );

  const [bedrooms, setBedrooms] = useState("any");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [savedIds, setSavedIds] = useState([]);

  const filteredProperties = useMemo(() => {
    let result = [...propertyData];

    // Location filter
    if (location.trim()) {
      result = result.filter(
        (property) =>
          property.location
            .toLowerCase()
            .includes(location.trim().toLowerCase()) ||
          property.city.toLowerCase().includes(location.trim().toLowerCase()),
      );
    }

    // Buy / Rent filter
    if (purpose !== "all" && purpose !== "sell") {
      result = result.filter((property) => property.purpose === purpose);
    }

    // Property type filter
    if (propertyType !== "Any Property") {
      result = result.filter(
        (property) => property.propertyType === propertyType,
      );
    }

    // Budget filter
    if (budget === "under25") {
      result = result.filter(
        (property) => property.purpose === "buy" && property.price < 25,
      );
    }

    if (budget === "25to50") {
      result = result.filter(
        (property) =>
          property.purpose === "buy" &&
          property.price >= 25 &&
          property.price <= 50,
      );
    }

    if (budget === "50to100") {
      result = result.filter(
        (property) =>
          property.purpose === "buy" &&
          property.price > 50 &&
          property.price <= 100,
      );
    }

    if (budget === "above100") {
      result = result.filter(
        (property) => property.purpose === "buy" && property.price > 100,
      );
    }

    // Bedroom filter
    if (bedrooms !== "any") {
      result = result.filter((property) =>
        bedrooms === "4+"
          ? property.bedrooms >= 4
          : property.bedrooms === Number(bedrooms),
      );
    }

    // Sorting
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else {
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return result;
  }, [location, purpose, propertyType, budget, bedrooms, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentProperties = filteredProperties.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const updateFilter = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setLocation("");
    setPurpose("all");
    setPropertyType("Any Property");
    setBudget("all");
    setBedrooms("any");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const toggleSaved = (id) => {
    setSavedIds((previous) =>
      previous.includes(id)
        ? previous.filter((savedId) => savedId !== id)
        : [...previous, id],
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* PAGE HEADER */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-5 py-12">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
            Discover your next home
          </span>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3">
            Explore Properties
          </h1>

          <p className="text-slate-500 mt-3">
            Find apartments, houses and villas that match your lifestyle.
          </p>

          {/* SEARCH INPUT */}
          <div className="mt-7 flex flex-col sm:flex-row gap-3 max-w-3xl">
            <div className="flex items-center gap-3 flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4">
              <MapPin size={20} className="text-blue-600" />

              <input
                type="text"
                value={location}
                onChange={(e) => updateFilter(setLocation, e.target.value)}
                placeholder="Search city or location..."
                className="w-full py-3 bg-transparent outline-none text-sm"
              />
            </div>

            <button
              onClick={() => setCurrentPage(1)}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3 rounded-lg transition"
            >
              <Search size={19} />
              Search
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="max-w-7xl mx-auto px-5 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* FILTER SIDEBAR */}
          <aside className="bg-white border border-slate-200 rounded-2xl p-6 h-fit">
            <div className="flex items-center justify-between mb-7">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal size={20} />
                Filters
              </h2>

              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 font-semibold hover:underline"
              >
                Clear all
              </button>
            </div>

            {/* PURPOSE */}
            <div className="mb-7">
              <h3 className="font-semibold text-slate-800 mb-3">
                Property Purpose
              </h3>

              <div className="grid grid-cols-3 gap-2">
                {["all", "buy", "rent"].map((item) => (
                  <button
                    key={item}
                    onClick={() => updateFilter(setPurpose, item)}
                    className={`py-2 rounded-lg text-sm font-medium capitalize transition ${
                      purpose === item
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {item === "all" ? "All" : item}
                  </button>
                ))}
              </div>
            </div>

            {/* PROPERTY TYPE */}
            <div className="mb-7">
              <h3 className="font-semibold text-slate-800 mb-3">
                Property Type
              </h3>

              <select
                value={propertyType}
                onChange={(e) => updateFilter(setPropertyType, e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none bg-white"
              >
                <option>Any Property</option>
                <option>Apartment</option>
                <option>House</option>
                <option>Villa</option>
                <option>Plot</option>
                <option>Commercial</option>
              </select>
            </div>

            {/* BUDGET */}
            <div className="mb-7">
              <h3 className="font-semibold text-slate-800 mb-3">Budget</h3>

              <select
                value={budget}
                onChange={(e) => updateFilter(setBudget, e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none bg-white"
              >
                <option value="all">Any Budget</option>
                <option value="under25">Under ₹25 Lac</option>
                <option value="25to50">₹25 Lac - ₹50 Lac</option>
                <option value="50to100">₹50 Lac - ₹1 Cr</option>
                <option value="above100">Above ₹1 Cr</option>
              </select>
            </div>

            {/* BEDROOMS */}
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Bedrooms</h3>

              <div className="grid grid-cols-3 gap-2">
                {["any", "1", "2", "3", "4+"].map((item) => (
                  <button
                    key={item}
                    onClick={() => updateFilter(setBedrooms, item)}
                    className={`py-2 rounded-lg text-sm font-medium transition ${
                      bedrooms === item
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {item === "any" ? "Any" : item}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* PROPERTY RESULTS */}
          <div className="lg:col-span-3">
            {/* RESULTS HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Available Properties
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {filteredProperties.length} properties found
                </p>
              </div>

              <div className="flex items-center gap-3">
                <ArrowUpDown size={18} className="text-slate-500" />

                <select
                  value={sortBy}
                  onChange={(e) => updateFilter(setSortBy, e.target.value)}
                  className="border border-slate-200 rounded-lg bg-white px-3 py-2.5 text-sm outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* ACTIVE FILTERS */}
            {(location ||
              purpose !== "all" ||
              propertyType !== "Any Property" ||
              budget !== "all" ||
              bedrooms !== "any") && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {location && (
                  <button
                    onClick={() => updateFilter(setLocation, "")}
                    className="bg-blue-50 text-blue-700 px-3 py-2 rounded-full text-xs flex items-center gap-2"
                  >
                    {location} <X size={14} />
                  </button>
                )}

                {purpose !== "all" && (
                  <button
                    onClick={() => updateFilter(setPurpose, "all")}
                    className="bg-blue-50 text-blue-700 px-3 py-2 rounded-full text-xs flex items-center gap-2 capitalize"
                  >
                    {purpose} <X size={14} />
                  </button>
                )}

                {propertyType !== "Any Property" && (
                  <button
                    onClick={() =>
                      updateFilter(setPropertyType, "Any Property")
                    }
                    className="bg-blue-50 text-blue-700 px-3 py-2 rounded-full text-xs flex items-center gap-2"
                  >
                    {propertyType} <X size={14} />
                  </button>
                )}

                {budget !== "all" && (
                  <button
                    onClick={() => updateFilter(setBudget, "all")}
                    className="bg-blue-50 text-blue-700 px-3 py-2 rounded-full text-xs flex items-center gap-2"
                  >
                    Budget selected <X size={14} />
                  </button>
                )}

                {bedrooms !== "any" && (
                  <button
                    onClick={() => updateFilter(setBedrooms, "any")}
                    className="bg-blue-50 text-blue-700 px-3 py-2 rounded-full text-xs flex items-center gap-2"
                  >
                    {bedrooms} Bedrooms <X size={14} />
                  </button>
                )}
              </div>
            )}

            {/* PROPERTY GRID */}
            {currentProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentProperties.map((property) => (
                  <article
                    key={property.id}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition group"
                  >
                    <div className="relative h-60 overflow-hidden">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />

                      <span className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-2 rounded-md text-xs font-semibold capitalize">
                        For {property.purpose}
                      </span>

                      <button
                        onClick={() => toggleSaved(property.id)}
                        aria-label={
                          savedIds.includes(property.id)
                            ? "Remove from saved"
                            : "Save property"
                        }
                        className="absolute top-4 right-4 bg-white p-2.5 rounded-full shadow hover:scale-110 transition"
                      >
                        <Heart
                          size={19}
                          className={
                            savedIds.includes(property.id)
                              ? "fill-red-500 text-red-500"
                              : "text-slate-700"
                          }
                        />
                      </button>
                    </div>

                    <div className="p-5">
                      <p className="text-blue-600 text-xl font-bold">
                        {property.priceLabel}
                      </p>

                      <h3 className="text-lg font-bold text-slate-900 mt-2">
                        {property.title}
                      </h3>

                      <p className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                        <MapPin size={16} />
                        {property.location}
                      </p>

                      <div className="grid grid-cols-3 gap-2 border-t border-slate-100 mt-5 pt-5 text-xs sm:text-sm text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <BedDouble size={17} />
                          {property.bedrooms} Beds
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Bath size={17} />
                          {property.bathrooms} Baths
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Maximize size={17} />
                          {property.area} sq.ft.
                        </span>
                      </div>

                      <Link
                        to={`/properties/${property.id}`}
                        className="block text-center bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 font-semibold rounded-lg py-3 mt-5 transition"
                      >
                        View Details
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl py-16 px-6 text-center">
                <Search size={42} className="text-slate-300 mx-auto" />

                <h3 className="text-xl font-bold text-slate-900 mt-5">
                  No properties found
                </h3>

                <p className="text-slate-500 mt-2">
                  Try changing your search filters.
                </p>

                <button
                  onClick={clearFilters}
                  className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-4 mt-10">
                <p className="text-sm text-slate-500">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(
                    startIndex + ITEMS_PER_PAGE,
                    filteredProperties.length,
                  )}{" "}
                  of {filteredProperties.length} properties
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={19} />
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1,
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg text-sm font-semibold ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100"
                    aria-label="Next page"
                  >
                    <ChevronRight size={19} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
