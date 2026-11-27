
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createConversation } from "../services/api/conversationApi";

import {
  fetchPropertyById,
  clearSelectedProperty,
} from "../app/slices/propertySlice";

import {
  createBookmark,
  deleteBookmark,
  fetchBookmarks,
} from "../app/slices/bookmarkSlice";

import { createVisit } from "../services/api/visitApi";

import PropertyGallery from "../components/property/PropertyGallery";
import ReviewSection from "../components/property/ReviewSection";

import {
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Heart,
  Share2,
  CheckCircle,
  Phone,
  Mail,
  MessageCircle,
  ChevronRight,
  Home,
  Car,
  Trees,
  ShieldCheck,
  Dumbbell,
  Waves,
  Building2,
  CalendarDays,
  Eye,
} from "lucide-react";

// Amenity icons
const amenityIcons = {
  "Swimming Pool": Waves,
  "Covered Parking": Car,
  Garden: Trees,
  "24/7 Security": ShieldCheck,
  Gym: Dumbbell,
  Lift: Building2,
  "Power Backup": CheckCircle,
};

// Format property price
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

// Format text
const formatText = (value = "") => {
  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function PropertyDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Property Redux state
  const {
    selectedProperty: property,
    detailsLoading,
    detailsError,
  } = useSelector((state) => state.properties);

  // Bookmark Redux state
  const { bookmarks } = useSelector(
    (state) => state.bookmarks
  );

  // Authentication Redux state
  const { isAuthenticated, user } = useSelector(
    (state) => state.auth
  );

  // Local state
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [bookmarkProcessing, setBookmarkProcessing] = useState(false);
  const [conversationLoading, setConversationLoading] = useState(false);

  // Schedule visit state
  const [visitData, setVisitData] = useState({
    visitDate: "",
    visitTime: "",
    message: "",
  });

  const [visitLoading, setVisitLoading] = useState(false);
  const [visitSuccess, setVisitSuccess] = useState(false);
  const [visitError, setVisitError] = useState("");

  // Fetch property details
  useEffect(() => {
    dispatch(fetchPropertyById(id));

    return () => {
      dispatch(clearSelectedProperty());
    };
  }, [dispatch, id]);

  // Fetch bookmarks when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchBookmarks());
    }
  }, [dispatch, isAuthenticated]);

  // Reset forms when property changes
  useEffect(() => {
    setFormSubmitted(false);
    setVisitSuccess(false);
    setVisitError("");

    setVisitData({
      visitDate: "",
      visitTime: "",
      message: "",
    });
  }, [id]);

  // Check whether current property is bookmarked
  const isSaved = bookmarks.some((bookmark) => {
    const bookmarkedProperty =
      typeof bookmark.property === "object"
        ? bookmark.property?._id
        : bookmark.property;

    return String(bookmarkedProperty || "") === String(id);
  });

  // Toggle bookmark
  const handleBookmark = async () => {
    if (!isAuthenticated) {
      alert("Please login to save properties.");
      return;
    }

    if (bookmarkProcessing) return;

    setBookmarkProcessing(true);

    try {
      if (isSaved) {
        await dispatch(deleteBookmark(id)).unwrap();
      } else {
        await dispatch(createBookmark(id)).unwrap();
      }
    } catch (error) {
      console.error("Bookmark Error:", error);

      alert(
        typeof error === "string"
          ? error
          : "Unable to update bookmark. Please try again."
      );
    } finally {
      setBookmarkProcessing(false);
    }
  };

  // Schedule property visit
  const handleScheduleVisit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setVisitError("Please login to schedule a property visit.");
      return;
    }

    if (user?.role !== "buyer") {
      setVisitError("Only buyer accounts can schedule property visits.");
      return;
    }

    if (visitLoading) return;

    setVisitLoading(true);
    setVisitError("");
    setVisitSuccess(false);

    try {
      await createVisit({
        propertyId: id,
        visitDate: visitData.visitDate,
        visitTime: visitData.visitTime,
        message: visitData.message.trim(),
      });

      setVisitSuccess(true);

      setVisitData({
        visitDate: "",
        visitTime: "",
        message: "",
      });
    } catch (error) {
      console.error("Schedule Visit Error:", error);

      setVisitError(
        error.response?.data?.message ||
          "Unable to schedule visit. Please try again."
      );
    } finally {
      setVisitLoading(false);
    }
  };

  // MESSAGE PROPERTY AGENT
const handleMessageAgent = async () => {
  if (!isAuthenticated) {
    navigate("/login");
    return;
  }

  if (user?.role !== "buyer") {
    alert("Only buyer accounts can message property agents.");
    return;
  }

  if (!owner._id) {
    alert("Agent information is unavailable.");
    return;
  }

  if (conversationLoading) return;

  try {
    setConversationLoading(true);

    const response = await createConversation({
      participantId: owner._id,
      propertyId: property._id,
    });

    // Support the common conversation response formats.
    const conversation =
      response?.conversation ||
      response?.data?.conversation ||
      response?.data ||
      response;

    const conversationId =
      conversation?._id || conversation?.conversation?._id;

    if (!conversationId) {
      throw new Error("Conversation ID was not returned by the server.");
    }

    navigate(`/chat?conversationId=${conversationId}`);
  } catch (error) {
    console.error("Create Conversation Error:", error);

    alert(
      error.response?.data?.message ||
        error.message ||
        "Unable to start conversation. Please try again."
    );
  } finally {
    setConversationLoading(false);
  }
};

  // Loading state
  if (detailsLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="text-slate-600 mt-4 font-medium">
            Loading property details...
          </p>
        </div>
      </div>
    );
  }

  // Error or property not found
  if (detailsError || !property) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-5 text-center">
        <Home size={48} className="text-slate-300" />

        <h1 className="text-2xl font-bold mt-5">
          Property Not Found
        </h1>

        <p className="text-slate-500 mt-2">
          {detailsError ||
            "This property may not exist or may have been removed."}
        </p>

        <Link
          to="/properties"
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Explore Properties
        </Link>
      </div>
    );
  }

  // Backend property data
  const location = property.location || {};
  const owner = property.owner || {};

  const fullLocation = [
    location.address,
    location.city,
    location.state,
    location.country,
    location.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const propertyType = formatText(property.propertyType || "");
  const listingType = property.listingType || "sale";

  const purpose =
    listingType === "rent" ? "For Rent" : "For Sale";

  const price = formatPrice(property.price, listingType);

  const area = `${Number(property.area || 0).toLocaleString("en-IN")} ${
    property.areaUnit || "sqft"
  }`;

  // Agent details
  const agentName = owner.name || "Property Agent";
  const agentEmail = owner.email || "";
  const agentPhone = owner.phone || "";
  const agentImage = owner.avatar || "";

  // Inquiry form
  const handleInquiry = (e) => {
    e.preventDefault();

    setFormSubmitted(true);
    e.currentTarget.reset();
  };

  // Google Maps URL
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    fullLocation || location.city || "India"
  )}`;

  // Tomorrow as minimum visit date
  const minimumVisitDate = (() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  })();

  const canScheduleVisit =
    isAuthenticated &&
    user?.role === "buyer" &&
    property.status === "available";

  return (
    <div className="min-h-screen bg-slate-50">

      {/* BREADCRUMB */}
      <div className="max-w-7xl mx-auto px-5 py-5">
        <div className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
          <Link to="/" className="hover:text-blue-600">
            Home
          </Link>

          <ChevronRight size={15} />

          <Link to="/properties" className="hover:text-blue-600">
            Properties
          </Link>

          <ChevronRight size={15} />

          <span className="text-slate-900 font-medium">
            {property.title}
          </span>
        </div>
      </div>

      {/* IMAGE GALLERY */}
      <section className="max-w-7xl mx-auto px-5">
        <div className="relative">

          <PropertyGallery
            images={property.images || []}
            title={property.title}
          />

          {/* PROPERTY PURPOSE */}
          <span className="absolute top-5 left-5 z-10 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
            {purpose}
          </span>

          {/* PROPERTY ACTIONS */}
          <div className="absolute top-5 right-5 z-10 flex gap-2">

            {/* BOOKMARK BUTTON */}
            <button
              onClick={handleBookmark}
              disabled={!isAuthenticated || bookmarkProcessing}
              aria-label={
                isSaved ? "Remove bookmark" : "Save property"
              }
              title={
                !isAuthenticated
                  ? "Login to save property"
                  : isSaved
                    ? "Remove bookmark"
                    : "Save property"
              }
              className="bg-white rounded-full p-3 shadow hover:scale-105 transition disabled:opacity-50"
            >
              <Heart
                size={20}
                className={
                  isSaved
                    ? "fill-red-500 text-red-500"
                    : "text-slate-700"
                }
              />
            </button>

            {/* SHARE BUTTON */}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: property.title,
                    url: window.location.href,
                  }).catch(() => {});
                } else if (navigator.clipboard) {
                  navigator.clipboard.writeText(
                    window.location.href
                  );
                }
              }}
              aria-label="Share property"
              className="bg-white rounded-full p-3 shadow hover:scale-105 transition"
            >
              <Share2 size={20} />
            </button>

          </div>
        </div>
      </section>

      {/* PROPERTY CONTENT */}
      <section className="max-w-7xl mx-auto px-5 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT CONTENT */}
          <div className="lg:col-span-2 space-y-8">

            {/* PROPERTY OVERVIEW */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
              <div className="flex flex-wrap justify-between gap-5">

                <div>
                  <span className="text-sm text-blue-600 font-semibold">
                    {propertyType}
                  </span>

                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                    {property.title}
                  </h1>

                  <p className="flex items-center gap-2 text-slate-500 mt-3">
                    <MapPin size={18} />
                    {fullLocation || "Location not available"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Property Price
                  </p>

                  <h2 className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">
                    {price}
                  </h2>
                </div>
              </div>

              {/* PROPERTY FEATURES */}
              
<div className="grid grid-cols-2 sm:grid-cols-5 gap-4 border-t border-slate-100 mt-8 pt-7">

  <div className="flex flex-col items-center gap-2">
    <BedDouble size={24} className="text-blue-600" />
    <strong>{property.bedrooms || 0} Bedrooms</strong>
  </div>

  <div className="flex flex-col items-center gap-2">
    <Bath size={24} className="text-blue-600" />
    <strong>{property.bathrooms || 0} Bathrooms</strong>
  </div>

  <div className="flex flex-col items-center gap-2">
    <Maximize size={24} className="text-blue-600" />
    <strong>{area}</strong>
  </div>

  <div className="flex flex-col items-center gap-2">
    <Building2 size={24} className="text-blue-600" />
    <strong>{propertyType}</strong>
  </div>

  <div className="flex flex-col items-center gap-2">
    <Eye size={24} className="text-blue-600" />
    <strong>
      {Number(property.views || 0).toLocaleString("en-IN")} Views
    </strong>
  </div>

</div>
            </div>

            {/* DESCRIPTION */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900">
                Property Description
              </h2>

              <p className="text-slate-600 leading-8 mt-5">
                {property.description || "No description available."}
              </p>

              <div className="flex flex-wrap gap-3 mt-6">

                <span className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-lg font-medium">
                  <CheckCircle size={15} className="inline mr-2" />
                  {formatText(property.status || "available")}
                </span>

                <span className="bg-blue-50 text-blue-700 text-sm px-4 py-2 rounded-lg font-medium">
                  <CheckCircle size={15} className="inline mr-2" />
                  {purpose}
                </span>

                {property.isVerified && (
                  <span className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-lg font-medium">
                    <ShieldCheck size={15} className="inline mr-2" />
                    Verified Property
                  </span>
                )}

              </div>
            </div>

            {/* AMENITIES */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900">
                Amenities & Features
              </h2>

              {property.amenities?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-7">
                  {property.amenities.map((amenity) => {
                    const Icon =
                      amenityIcons[amenity] || CheckCircle;

                    return (
                      <div
                        key={amenity}
                        className="flex items-center gap-3 text-slate-600"
                      >
                        <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                          <Icon size={20} />
                        </div>

                        <span>{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-500 mt-5">
                  No amenities listed for this property.
                </p>
              )}
            </div>

            {/* LOCATION */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900">
                Property Location
              </h2>

              <p className="flex items-center gap-2 text-slate-500 mt-3">
                <MapPin size={18} className="text-blue-600" />
                {fullLocation || "Location not available"}
              </p>

              <div className="mt-6 rounded-xl bg-slate-100 border border-slate-200 p-8 text-center">
                <MapPin
                  size={36}
                  className="text-blue-600 mx-auto"
                />

                <h3 className="font-semibold text-slate-800 mt-3">
                  Explore this location
                </h3>

                <p className="text-sm text-slate-500 mt-2">
                  View the property's area on Google Maps.
                </p>

                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-lg mt-5"
                >
                  Open Google Maps
                </a>
              </div>
            </div>

            {/* PROPERTY REVIEWS */}
            <ReviewSection propertyId={property._id} />

          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-6">

            {/* AGENT CARD */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-slate-900">
                Contact Property Agent
              </h2>

              <div className="flex items-center gap-4 mt-6">
                {agentImage ? (
                  <img
                    src={agentImage}
                    alt={agentName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
                    {agentName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-slate-900">
                    {agentName}
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Property Agent
                  </p>

                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle size={13} />
                    Property Owner
                  </p>
                </div>
              </div>

             <div className="space-y-3 mt-6">

  {/* MESSAGE AGENT */}
  <button
    type="button"
    onClick={handleMessageAgent}
    disabled={
      conversationLoading ||
      !owner._id ||
      (isAuthenticated && user?.role !== "buyer")
    }
    className="flex items-center justify-center gap-2 w-full bg-[#006A4E] hover:bg-[#00543E] disabled:bg-gray-400 text-white rounded-lg py-3 font-semibold transition"
  >
    {conversationLoading ? (
      <>
        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        Starting Conversation...
      </>
    ) : (
      <>
        <MessageCircle size={18} />
        Message Agent
      </>
    )}
  </button>

  {/* CALL AGENT */}
  {agentPhone && (
    <a
      href={`tel:${agentPhone.replace(/\s/g, "")}`}
      className="flex items-center justify-center gap-2 w-full border border-slate-200 rounded-lg py-3 font-semibold text-slate-700 hover:bg-slate-50"
    >
      <Phone size={18} />
      Call Agent
    </a>
  )}

  {/* EMAIL AGENT */}
  {agentEmail && (
    <a
      href={`mailto:${agentEmail}`}
      className="flex items-center justify-center gap-2 w-full border border-slate-200 rounded-lg py-3 font-semibold text-slate-700 hover:bg-slate-50"
    >
      <Mail size={18} />
      Email Agent
    </a>
  )}

</div>
            </div>

            {/* SCHEDULE PROPERTY VISIT */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-slate-900">
                Schedule a Visit
              </h2>

              <p className="text-sm text-slate-500 mt-2">
                Book a visit to explore this property in person.
              </p>

              {!isAuthenticated ? (
                <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-sm text-blue-700">
                    Please login to schedule a property visit.
                  </p>

                  <Link
                    to="/login"
                    className="inline-block mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    Login
                  </Link>
                </div>
              ) : user?.role !== "buyer" ? (
                <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-amber-700">
                    Only buyer accounts can schedule property visits.
                  </p>
                </div>
              ) : property.status !== "available" ? (
                <div className="mt-5 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-sm text-slate-600">
                    Visit scheduling is unavailable because this property is not currently available.
                  </p>
                </div>
              ) : visitSuccess ? (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                  <CheckCircle
                    size={35}
                    className="text-green-600 mx-auto"
                  />

                  <h3 className="font-bold text-green-800 mt-3">
                    Visit Request Submitted!
                  </h3>

                  <p className="text-sm text-green-700 mt-2">
                    Your visit request has been sent to the property agent.
                    You can check its status from My Visits.
                  </p>

                  <Link
                    to="/my-visits"
                    className="inline-block mt-4 text-green-800 font-semibold underline"
                  >
                    View My Visits
                  </Link>

                  <button
                    type="button"
                    onClick={() => setVisitSuccess(false)}
                    className="block mx-auto text-sm text-green-800 font-semibold mt-4"
                  >
                    Schedule another visit
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleScheduleVisit}
                  className="space-y-4 mt-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Preferred Date
                    </label>

                    <input
                      type="date"
                      required
                      min={minimumVisitDate}
                      value={visitData.visitDate}
                      onChange={(e) =>
                        setVisitData((prev) => ({
                          ...prev,
                          visitDate: e.target.value,
                        }))
                      }
                      className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Preferred Time
                    </label>

                    <select
                      required
                      value={visitData.visitTime}
                      onChange={(e) =>
                        setVisitData((prev) => ({
                          ...prev,
                          visitTime: e.target.value,
                        }))
                      }
                      className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500"
                    >
                      <option value="">Select a time</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="10:30 AM">10:30 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="12:00 PM">12:00 PM</option>
                      <option value="12:30 PM">12:30 PM</option>
                      <option value="01:00 PM">01:00 PM</option>
                      <option value="01:30 PM">01:30 PM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="02:30 PM">02:30 PM</option>
                      <option value="03:00 PM">03:00 PM</option>
                      <option value="03:30 PM">03:30 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                      <option value="04:30 PM">04:30 PM</option>
                      <option value="05:00 PM">05:00 PM</option>
                      <option value="05:30 PM">05:30 PM</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Message to Agent (Optional)
                    </label>

                    <textarea
                      rows="3"
                      maxLength={500}
                      value={visitData.message}
                      onChange={(e) =>
                        setVisitData((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                      placeholder="Let the agent know anything about your visit..."
                      className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500 resize-none"
                    />
                  </div>

                  {visitError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-600">
                        {visitError}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={visitLoading || !canScheduleVisit}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg py-3 flex items-center justify-center gap-2 transition"
                  >
                    {visitLoading ? (
                      "Submitting Request..."
                    ) : (
                      <>
                        <CalendarDays size={18} />
                        Schedule Property Visit
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* INQUIRY FORM */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-slate-900">
                Send an Inquiry
              </h2>

              <p className="text-sm text-slate-500 mt-2">
                Interested in this property? Contact the agent.
              </p>

              {formSubmitted ? (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                  <CheckCircle
                    size={35}
                    className="text-green-600 mx-auto"
                  />

                  <h3 className="font-bold text-green-800 mt-3">
                    Inquiry submitted!
                  </h3>

                  <p className="text-sm text-green-700 mt-2">
                    This is currently a UI demonstration.
                    We will connect the inquiry form to the backend later.
                  </p>

                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="text-sm text-green-800 font-semibold underline mt-4"
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleInquiry}
                  className="space-y-4 mt-6"
                >
                  <input
                    type="text"
                    name="name"
                    placeholder="Your full name"
                    required
                    className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500"
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder="Your email address"
                    required
                    className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500"
                  />

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Your phone number"
                    required
                    className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500"
                  />

                  <textarea
                    name="message"
                    rows="4"
                    defaultValue={`Hi, I am interested in ${property.title}. Please share more details.`}
                    required
                    className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500 resize-none"
                  />

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-3 flex items-center justify-center gap-2 transition"
                  >
                    <MessageCircle size={18} />
                    Send Inquiry
                  </button>
                </form>
              )}
            </div>

          </aside>
        </div>
      </section>
    </div>
  );
}
