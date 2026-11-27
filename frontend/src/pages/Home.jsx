
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  ArrowRight,
  ShieldCheck,
  Headset,
  House,
  Building2,
  Heart,
} from "lucide-react";

import useProperties from "../hooks/useProperties";

const locations = [
  {
    name: "Kolkata",
    properties: "Explore Properties",
    image:
      "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Mumbai",
    properties: "Explore Properties",
    image:
      "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Bengaluru",
    properties: "Explore Properties",
    image:
      "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Delhi",
    properties: "Explore Properties",
    image:
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=700&q=85",
  },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Trusted Properties",
    description:
      "Explore property listings with clear information and reliable details.",
  },
  {
    icon: Headset,
    title: "Expert Assistance",
    description:
      "Connect with property agents who can guide you through your journey.",
  },
  {
    icon: House,
    title: "Wide Property Choices",
    description:
      "Discover apartments, houses, villas and properties across different cities.",
  },
];

const formatPrice = (price, listingType) => {
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price || 0);

  return listingType === "rent"
    ? `${formattedPrice}/month`
    : formattedPrice;
};

const formatArea = (area, areaUnit) => {
  return `${Number(area || 0).toLocaleString("en-IN")} ${areaUnit || "sqft"}`;
};

export default function Home() {
  const navigate = useNavigate();

  const { properties, loading, error } = useProperties();

  const [activeTab, setActiveTab] = useState("Buy");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("Any Property");
  const [budget, setBudget] = useState("Any Budget");

  // Show featured properties first, then other available properties.
  const featuredProperties = [...properties]
    .filter((property) => property.status === "available")
    .sort(
      (a, b) => Number(b.isFeatured) - Number(a.isFeatured)
    )
    .slice(0, 3);

  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams({
      purpose: activeTab.toLowerCase(),
      location,
      propertyType,
      budget,
    });

    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="bg-white">
      {/* HERO SECTION */}
      <section className="relative min-h-[620px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=90')",
          }}
        />

        <div className="absolute inset-0 bg-slate-950/60" />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-5 py-20">
          <div className="max-w-3xl">
            <span className="inline-block bg-white/15 text-white border border-white/30 rounded-full px-4 py-2 text-sm mb-6">
              Find a place you'll love to call home
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Find Your Perfect
              <span className="text-blue-400"> Place </span>
              to Call Home
            </h1>

            <p className="text-slate-200 text-lg mt-6 max-w-2xl leading-8">
              Discover properties that match your lifestyle. Buy, rent or
              explore your next investment with HomeHunt.
            </p>

            {/* SEARCH BOX */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 mt-10 shadow-2xl">
              <div className="flex gap-3 mb-6">
                {["Buy", "Rent", "Sell"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2.5 rounded-lg font-semibold transition ${
                      activeTab === tab
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* SEARCH FORM */}
              <form
                onSubmit={handleSearch}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Location
                  </label>

                  <div className="flex items-center border border-slate-200 rounded-lg px-3">
                    <MapPin size={19} className="text-blue-600" />

                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter city or location"
                      className="w-full p-3 outline-none text-sm min-w-0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Property Type
                  </label>

                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-3 outline-none text-sm bg-white"
                  >
                    <option>Any Property</option>
                    <option>Apartment</option>
                    <option>House</option>
                    <option>Villa</option>
                    <option>Plot</option>
                    <option>Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Budget
                  </label>

                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-3 outline-none text-sm bg-white"
                  >
                    <option>Any Budget</option>
                    <option>Under 25 Lac</option>
                    <option>25 Lac - 50 Lac</option>
                    <option>50 Lac - 1 Cr</option>
                    <option>Above 1 Cr</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg p-3 transition"
                  >
                    <Search size={19} />
                    Search
                  </button>
                </div>
              </form>
            </div>

            <div className="flex flex-wrap gap-6 mt-8 text-white text-sm">
              <span>✓ Verified listings</span>
              <span>✓ Trusted agents</span>
              <span>✓ Easy property search</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
            <div>
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
                Discover properties
              </span>

              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3">
                Featured Properties
              </h2>

              <p className="text-slate-500 mt-3">
                Explore some of our handpicked properties.
              </p>
            </div>

            <Link
              to="/properties"
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all"
            >
              View All Properties <ArrowRight size={19} />
            </Link>
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-500 mt-4">
                Loading properties...
              </p>
            </div>
          )}

          {/* ERROR STATE */}
          {!loading && error && (
            <div className="text-center py-12 bg-white rounded-xl border border-red-200">
              <p className="text-red-600 font-medium">{error}</p>
              <p className="text-slate-500 text-sm mt-2">
                Please try refreshing the page.
              </p>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && !error && featuredProperties.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <House size={40} className="text-slate-400 mx-auto" />
              <h3 className="text-xl font-semibold text-slate-800 mt-4">
                No Properties Available
              </h3>
              <p className="text-slate-500 mt-2">
                New properties will appear here when they are listed.
              </p>
            </div>
          )}

          {/* PROPERTY CARDS */}
          {!loading && !error && featuredProperties.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {featuredProperties.map((property) => (
                <article
                  key={property._id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition group"
                >
                  <div className="relative h-60 overflow-hidden">
                    <img
                      src={
                        property.images?.[0]?.url ||
                        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=85"
                      }
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />

                    <span className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-md">
                      {property.listingType === "rent"
                        ? "For Rent"
                        : "For Sale"}
                    </span>

                    {property.isVerified && (
                      <span className="absolute bottom-4 left-4 bg-green-600 text-white text-xs font-semibold px-3 py-2 rounded-md">
                        Verified
                      </span>
                    )}

                    <button
                      aria-label="Save property"
                      className="absolute top-4 right-4 bg-white p-2.5 rounded-full text-slate-700 hover:text-red-500 transition"
                    >
                      <Heart size={19} />
                    </button>
                  </div>

                  <div className="p-5">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatPrice(property.price, property.listingType)}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mt-3">
                      {property.title}
                    </h3>

                    <p className="flex items-center gap-2 text-slate-500 text-sm mt-2">
                      <MapPin size={16} />
                      {property.location?.address},{" "}
                      {property.location?.city}
                    </p>

                    <div className="grid grid-cols-3 border-t border-slate-100 mt-5 pt-5 text-sm text-slate-600">
                      <span className="flex items-center gap-2">
                        <BedDouble size={17} />
                        {property.propertyType === "plot"
                          ? "Plot"
                          : `${property.bedrooms} Beds`}
                      </span>

                      <span className="flex items-center gap-2">
                        <Bath size={17} />
                        {property.propertyType === "plot"
                          ? "Land"
                          : `${property.bathrooms} Baths`}
                      </span>

                      <span className="flex items-center gap-2">
                        <Maximize size={17} />
                        {formatArea(property.area, property.areaUnit)}
                      </span>
                    </div>

                    <Link
                      to={`/properties?property=${property._id}`}
                      className="block text-center bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 font-semibold rounded-lg py-3 mt-5 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* POPULAR LOCATIONS */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
              Explore cities
            </span>

            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3">
              Popular Locations
            </h2>

            <p className="text-slate-500 mt-3">
              Find your dream property in India's most popular cities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {locations.map((location) => (
              <Link
                key={location.name}
                to={`/properties?location=${encodeURIComponent(location.name)}`}
                className="relative h-72 rounded-2xl overflow-hidden group"
              >
                <img
                  src={location.image}
                  alt={location.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-bold">
                    {location.name}
                  </h3>

                  <p className="text-sm text-slate-200 mt-2">
                    {location.properties}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE HOMEHUNT */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
              Why HomeHunt
            </span>

            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3">
              Making Property Search Easier
            </h2>

            <p className="text-slate-500 mt-3 max-w-2xl mx-auto">
              We help you make confident property decisions with useful tools
              and a simple discovery experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className="bg-white p-8 rounded-2xl border border-slate-200 text-center hover:shadow-lg transition"
                >
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                    <Icon size={30} />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mt-6">
                    {benefit.title}
                  </h3>

                  <p className="text-slate-500 leading-7 mt-3">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-5">
          <div className="bg-blue-700 rounded-3xl px-6 py-14 sm:px-12 sm:py-16 text-center">
            <Building2 size={42} className="text-blue-200 mx-auto" />

            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-6">
              Ready to Find Your Dream Property?
            </h2>

            <p className="text-blue-100 mt-4 max-w-2xl mx-auto leading-7">
              Start exploring properties today and take the next step towards
              finding your perfect home.
            </p>

            <Link
              to="/properties"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-7 py-3.5 rounded-lg mt-8 hover:bg-blue-50 transition"
            >
              Explore Properties <ArrowRight size={19} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
