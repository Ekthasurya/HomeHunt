
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
  Search,
  MapPin,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import useProperties from "../hooks/useProperties";
import PropertyGrid from "../components/property/PropertyGrid";

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

  const { properties = [], loading, error } = useProperties();

  const [location, setLocation] = useState(
    searchParams.get("location") || ""
  );

  const [purpose, setPurpose] = useState(
    searchParams.get("purpose") || "all"
  );

  const [propertyType, setPropertyType] = useState(
    searchParams.get("propertyType") || "Any Property"
  );

  const [budget, setBudget] = useState(
    getInitialBudget(searchParams.get("budget"))
  );

  const [bedrooms, setBedrooms] = useState("any");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    let result = [...properties];

    // Available properties only
    result = result.filter((property) => {
      const status = String(
        property.status || "available"
      ).toLowerCase();

      return status === "available";
    });

    // Location search
    if (location.trim()) {
      const search = location.trim().toLowerCase();

      result = result.filter((property) => {
        const propertyLocation = property.location || {};

        const searchableText = [
          property.title,
          property.description,
          propertyLocation.address,
          propertyLocation.city,
          propertyLocation.state,
          propertyLocation.country,
          propertyLocation.pincode,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(search);
      });
    }

    // Buy / Rent filter
    if (purpose === "buy") {
      result = result.filter(
        (property) =>
          String(property.listingType).toLowerCase() === "sale"
      );
    } else if (purpose === "rent") {
      result = result.filter(
        (property) =>
          String(property.listingType).toLowerCase() === "rent"
      );
    }

    // Property type filter
    if (propertyType !== "Any Property") {
      const selectedType = propertyType.toLowerCase();

      result = result.filter(
        (property) =>
          String(property.propertyType).toLowerCase() === selectedType
      );
    }

    // Budget filter
    if (budget !== "all") {
      result = result.filter((property) => {
        const price = Number(property.price) || 0;

        if (budget === "under25") {
          return price < 2500000;
        }

        if (budget === "25to50") {
          return price >= 2500000 && price <= 5000000;
        }

        if (budget === "50to100") {
          return price > 5000000 && price <= 10000000;
        }

        if (budget === "above100") {
          return price > 10000000;
        }

        return true;
      });
    }

    // Bedroom filter
    if (bedrooms !== "any") {
      result = result.filter((property) => {
        const count = Number(property.bedrooms) || 0;

        return bedrooms === "4+"
          ? count >= 4
          : count === Number(bedrooms);
      });
    }

    // Sorting
    if (sortBy === "price-low") {
      result.sort(
        (a, b) =>
          Number(a.price || 0) - Number(b.price || 0)
      );
    } else if (sortBy === "price-high") {
      result.sort(
        (a, b) =>
          Number(b.price || 0) - Number(a.price || 0)
      );
    } else {
      result.sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );
    }

    return result;
  }, [
    properties,
    location,
    purpose,
    propertyType,
    budget,
    bedrooms,
    sortBy,
  ]);

  // Pagination
  const totalPages = Math.ceil(
    filteredProperties.length / ITEMS_PER_PAGE
  );

  // Keep current page valid after filtering
  useEffect(() => {
    setCurrentPage((page) => {
      if (totalPages === 0) return 1;

      return Math.min(page, totalPages);
    });
  }, [totalPages]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentProperties = filteredProperties.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Update filters
  const updateFilter = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setLocation("");
    setPurpose("all");
    setPropertyType("Any Property");
    setBudget("all");
    setBedrooms("any");
    setSortBy("newest");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* PAGE HEADER */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12">

          <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Discover your next home
          </span>

          <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Explore Properties
          </h1>

          <p className="mt-3 text-slate-500">
            Find apartments, houses and villas that match your lifestyle.
          </p>

          {/* SEARCH */}
          <div className="mt-7 flex max-w-3xl flex-col gap-3 sm:flex-row">

            <div className="flex flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4">

              <MapPin size={20} className="text-blue-600" />

              <input
                type="text"
                value={location}
                onChange={(e) =>
                  updateFilter(setLocation, e.target.value)
                }
                placeholder="Search city, state or location..."
                className="w-full bg-transparent py-3 text-sm outline-none"
              />

            </div>

            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              <Search size={19} />
              Search
            </button>

          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="mx-auto max-w-7xl px-5 py-10">

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">

          {/* FILTER SIDEBAR */}
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6">

            <div className="mb-7 flex items-center justify-between">

              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <SlidersHorizontal size={20} />
                Filters
              </h2>

              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-blue-600 hover:underline"
              >
                Clear all
              </button>

            </div>

            {/* PURPOSE */}
            <div className="mb-7">

              <h3 className="mb-3 font-semibold text-slate-800">
                Property Purpose
              </h3>

              <div className="grid grid-cols-3 gap-2">

                {["all", "buy", "rent"].map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() =>
                      updateFilter(setPurpose, item)
                    }
                    className={`rounded-lg py-2 text-sm font-medium capitalize transition ${
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

              <h3 className="mb-3 font-semibold text-slate-800">
                Property Type
              </h3>

              <select
                value={propertyType}
                onChange={(e) =>
                  updateFilter(setPropertyType, e.target.value)
                }
                className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none"
              >
                <option value="Any Property">Any Property</option>
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Villa">Villa</option>
                <option value="Plot">Plot</option>
                <option value="Commercial">Commercial</option>
              </select>

            </div>

            {/* BUDGET */}
            <div className="mb-7">

              <h3 className="mb-3 font-semibold text-slate-800">
                Budget
              </h3>

              <select
                value={budget}
                onChange={(e) =>
                  updateFilter(setBudget, e.target.value)
                }
                className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none"
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

              <h3 className="mb-3 font-semibold text-slate-800">
                Bedrooms
              </h3>

              <div className="grid grid-cols-3 gap-2">

                {["any", "1", "2", "3", "4+"].map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() =>
                      updateFilter(setBedrooms, item)
                    }
                    className={`rounded-lg py-2 text-sm font-medium transition ${
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
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Available Properties
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {loading
                    ? "Loading properties..."
                    : `${filteredProperties.length} properties found`}
                </p>
              </div>

              <div className="flex items-center gap-3">

                <ArrowUpDown size={18} className="text-slate-500" />

                <select
                  value={sortBy}
                  onChange={(e) =>
                    updateFilter(setSortBy, e.target.value)
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>

              </div>
            </div>

            {/* LOADING */}
            {loading && (
              <div className="rounded-2xl bg-white py-16 text-center">

                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

                <p className="mt-4 text-slate-500">
                  Loading properties...
                </p>

              </div>
            )}

            {/* ERROR */}
            {!loading && error && (
              <div className="rounded-2xl border border-red-200 bg-white px-6 py-12 text-center">

                <p className="font-semibold text-red-600">
                  {typeof error === "string"
                    ? error
                    : "Unable to load properties."}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Please check your backend server and try again.
                </p>

              </div>
            )}

            {/* REUSABLE PROPERTY GRID */}
            {!loading && !error && currentProperties.length > 0 && (
              <PropertyGrid
                properties={currentProperties}
              />
            )}

            {/* EMPTY STATE */}
            {!loading && !error && currentProperties.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">

                <Search
                  size={42}
                  className="mx-auto text-slate-300"
                />

                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  No properties found
                </h3>

                <p className="mt-2 text-slate-500">
                  Try changing your search filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  Clear Filters
                </button>

              </div>
            )}

            {/* PAGINATION */}
            {!loading && !error && totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-between gap-4">

                <p className="text-sm text-slate-500">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(
                    startIndex + ITEMS_PER_PAGE,
                    filteredProperties.length
                  )}{" "}
                  of {filteredProperties.length} properties
                </p>

                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.max(1, page - 1)
                      )
                    }
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                    className="rounded-lg border border-slate-200 p-2.5 hover:bg-slate-100 disabled:opacity-40"
                  >
                    <ChevronLeft size={19} />
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((page) => (
                    <button
                      type="button"
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-10 w-10 rounded-lg text-sm font-semibold ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(totalPages, page + 1)
                      )
                    }
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                    className="rounded-lg border border-slate-200 p-2.5 hover:bg-slate-100 disabled:opacity-40"
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
