
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
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
  ChevronLeft,
  Home,
  Car,
  Trees,
  ShieldCheck,
  Dumbbell,
  Waves,
  Building2,
} from "lucide-react";

// Sample property data
const properties = [
  {
    id: "1",
    title: "Modern Family Villa",
    location: "New Town, Kolkata, West Bengal",
    price: "₹85 Lac",
    purpose: "For Sale",
    type: "Villa",
    bedrooms: 4,
    bathrooms: 3,
    area: "2,400 sq.ft.",
    status: "Ready to Move",
    description:
      "Experience comfortable family living in this beautiful modern villa. Designed with spacious interiors, natural lighting and contemporary architecture, this property offers an ideal combination of comfort and convenience. Enjoy a peaceful residential environment with easy access to shopping, schools and essential facilities.",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=90",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=90",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=90",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=90",
    ],
    amenities: [
      "Swimming Pool",
      "Covered Parking",
      "Garden",
      "24/7 Security",
      "Gym",
      "Power Backup",
      "Modern Kitchen",
      "Balcony",
    ],
    agent: {
      name: "Rahul Sharma",
      role: "Property Consultant",
      phone: "+91 98765 43210",
      email: "rahul@example.com",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=85",
    },
  },
  {
    id: "2",
    title: "Luxury Apartment",
    location: "Salt Lake, Kolkata, West Bengal",
    price: "₹35,000/month",
    purpose: "For Rent",
    type: "Apartment",
    bedrooms: 3,
    bathrooms: 2,
    area: "1,650 sq.ft.",
    status: "Ready to Move",
    description:
      "A spacious apartment with a contemporary interior, comfortable bedrooms and convenient access to everyday facilities. An excellent option for families looking for a well-connected residential location.",
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=90",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=90",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=90",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=90",
    ],
    amenities: [
      "Lift",
      "Covered Parking",
      "Security",
      "Power Backup",
      "Balcony",
      "Modern Kitchen",
    ],
    agent: {
      name: "Priya Das",
      role: "Rental Property Agent",
      phone: "+91 98765 12345",
      email: "priya@example.com",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=85",
    },
  },
  {
    id: "3",
    title: "Premium Modern House",
    location: "Rajarhat, Kolkata, West Bengal",
    price: "₹1.2 Cr",
    purpose: "For Sale",
    type: "House",
    bedrooms: 4,
    bathrooms: 4,
    area: "2,800 sq.ft.",
    status: "Ready to Move",
    description:
      "Discover a stylish independent house with generous living spaces, elegant interiors and modern facilities. The property is designed for families who value privacy, comfort and convenient city access.",
    images: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=90",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=90",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=90",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=90",
    ],
    amenities: [
      "Garden",
      "Parking",
      "Security",
      "Power Backup",
      "Balcony",
      "Modular Kitchen",
    ],
    agent: {
      name: "Amit Roy",
      role: "Senior Property Consultant",
      phone: "+91 98765 67890",
      email: "amit@example.com",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=85",
    },
  },
];

const amenityIcons = {
  "Swimming Pool": Waves,
  "Covered Parking": Car,
  Garden: Trees,
  "24/7 Security": ShieldCheck,
  Gym: Dumbbell,
  Lift: Building2,
  "Power Backup": CheckCircle,
};

export default function PropertyDetails() {
  const { id } = useParams();

  const property = properties.find((item) => item.id === id);

  const [activeImage, setActiveImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  if (!property) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-5 text-center">
        <Home size={48} className="text-slate-300" />

        <h1 className="text-2xl font-bold mt-5">
          Property Not Found
        </h1>

        <p className="text-slate-500 mt-2">
          This property may not exist or may have been removed.
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

  const nextImage = () => {
    setActiveImage((previous) =>
      (previous + 1) % property.images.length
    );
  };

  const previousImage = () => {
    setActiveImage((previous) =>
      (previous - 1 + property.images.length) %
      property.images.length
    );
  };

  const handleInquiry = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    e.currentTarget.reset();
  };

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    property.location
  )}`;

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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-auto lg:h-[500px]">

          {/* MAIN IMAGE */}
          <div className="lg:col-span-3 relative h-[300px] sm:h-[420px] lg:h-full rounded-2xl overflow-hidden group">

            <img
              src={property.images[activeImage]}
              alt={property.title}
              className="w-full h-full object-cover"
            />

            <span className="absolute top-5 left-5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
              {property.purpose}
            </span>

            <div className="absolute top-5 right-5 flex gap-2">

              <button
                onClick={() => setIsSaved(!isSaved)}
                aria-label="Save property"
                className="bg-white rounded-full p-3 shadow hover:scale-105 transition"
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

            {/* GALLERY CONTROLS */}
            <button
              onClick={previousImage}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow opacity-100 lg:opacity-0 group-hover:opacity-100 transition"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              onClick={nextImage}
              aria-label="Next image"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow opacity-100 lg:opacity-0 group-hover:opacity-100 transition"
            >
              <ChevronRight size={22} />
            </button>

            <span className="absolute bottom-5 right-5 bg-black/60 text-white text-sm px-4 py-2 rounded-full">
              {activeImage + 1} / {property.images.length}
            </span>

          </div>

          {/* THUMBNAILS */}
          <div className="grid grid-cols-3 lg:grid-cols-1 lg:grid-rows-4 gap-3">

            {property.images.map((image, index) => (
              <button
                key={image}
                onClick={() => setActiveImage(index)}
                className={`relative h-24 sm:h-32 lg:h-auto rounded-xl overflow-hidden ${
                  activeImage === index
                    ? "ring-4 ring-blue-600"
                    : ""
                }`}
              >
                <img
                  src={image}
                  alt={`${property.title} view ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}

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
                    {property.type}
                  </span>

                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                    {property.title}
                  </h1>

                  <p className="flex items-center gap-2 text-slate-500 mt-3">
                    <MapPin size={18} />
                    {property.location}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Property Price
                  </p>

                  <h2 className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">
                    {property.price}
                  </h2>
                </div>

              </div>

              {/* PROPERTY FEATURES */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 mt-8 pt-7">

                <div className="flex flex-col items-center gap-2">
                  <BedDouble size={24} className="text-blue-600" />
                  <strong>{property.bedrooms} Bedrooms</strong>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <Bath size={24} className="text-blue-600" />
                  <strong>{property.bathrooms} Bathrooms</strong>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <Maximize size={24} className="text-blue-600" />
                  <strong>{property.area}</strong>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <Building2 size={24} className="text-blue-600" />
                  <strong>{property.type}</strong>
                </div>

              </div>

            </div>

            {/* DESCRIPTION */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">

              <h2 className="text-xl font-bold text-slate-900">
                Property Description
              </h2>

              <p className="text-slate-600 leading-8 mt-5">
                {property.description}
              </p>

              <div className="flex flex-wrap gap-3 mt-6">

                <span className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-lg font-medium">
                  <CheckCircle size={15} className="inline mr-2" />
                  {property.status}
                </span>

                <span className="bg-blue-50 text-blue-700 text-sm px-4 py-2 rounded-lg font-medium">
                  <CheckCircle size={15} className="inline mr-2" />
                  {property.purpose}
                </span>

              </div>

            </div>

            {/* AMENITIES */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">

              <h2 className="text-xl font-bold text-slate-900">
                Amenities & Features
              </h2>

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

            </div>

            {/* LOCATION */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">

              <h2 className="text-xl font-bold text-slate-900">
                Property Location
              </h2>

              <p className="flex items-center gap-2 text-slate-500 mt-3">
                <MapPin size={18} className="text-blue-600" />
                {property.location}
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

          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-6">

            {/* AGENT CARD */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">

              <h2 className="text-xl font-bold text-slate-900">
                Contact Property Agent
              </h2>

              <div className="flex items-center gap-4 mt-6">

                <img
                  src={property.agent.image}
                  alt={property.agent.name}
                  className="w-16 h-16 rounded-full object-cover"
                />

                <div>
                  <h3 className="font-bold text-slate-900">
                    {property.agent.name}
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    {property.agent.role}
                  </p>

                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle size={13} />
                    Sample agent profile
                  </p>
                </div>

              </div>

              <div className="space-y-3 mt-6">

                <a
                  href={`tel:${property.agent.phone.replace(/\s/g, "")}`}
                  className="flex items-center justify-center gap-2 w-full border border-slate-200 rounded-lg py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Phone size={18} />
                  Call Agent
                </a>

                <a
                  href={`mailto:${property.agent.email}`}
                  className="flex items-center justify-center gap-2 w-full border border-slate-200 rounded-lg py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Mail size={18} />
                  Email Agent
                </a>

              </div>

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
                    This is a UI demonstration. We'll connect
                    the inquiry form to the backend later.
                  </p>

                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="text-sm text-green-800 font-semibold underline mt-4"
                  >
                    Send another inquiry
                  </button>

                </div>
              ) : (
                <form onSubmit={handleInquiry} className="space-y-4 mt-6">

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
