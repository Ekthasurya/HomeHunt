
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Plus,
  SlidersHorizontal,
  MapPin,
  Pencil,
  Trash2,
  Eye,
  X,
  RefreshCw,
  ImagePlus,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  getManagedProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImages,
} from "../../services/api/propertyApi";

const emptyForm = {
  title: "",
  description: "",
  propertyType: "apartment",
  listingType: "sale",
  price: "",
  area: "",
  areaUnit: "sqft",
  bedrooms: "2",
  bathrooms: "1",
  status: "available",
  address: "",
  city: "",
  state: "",
};

function PropertiesManagement() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // Image states
  const [existingImages, setExistingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedPreviews, setSelectedPreviews] = useState([]);

  const isAdmin = user?.role === "admin";

  // Generate previews for newly selected images
  useEffect(() => {
    const urls = selectedFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setSelectedPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  // Fetch properties
  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getManagedProperties();

      setProperties(response.properties || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load properties."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Search and filters
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const location = property.location || {};

      const matchesSearch =
        property.title?.toLowerCase().includes(search.toLowerCase()) ||
        location.city?.toLowerCase().includes(search.toLowerCase()) ||
        location.address?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        property.status === statusFilter;

      const matchesType =
        typeFilter === "All" ||
        property.propertyType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [properties, search, statusFilter, typeFilter]);

  // Currency formatter
  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price || 0);

  // Location formatter
  const formatLocation = (location) => {
    if (!location) return "Location unavailable";

    return [
      location.address,
      location.city,
      location.state,
    ]
      .filter(Boolean)
      .join(", ");
  };

  // Status styles
  const statusStyles = {
    available: "bg-green-50 text-green-700",
    pending: "bg-yellow-50 text-yellow-700",
    sold: "bg-blue-50 text-blue-700",
    rented: "bg-purple-50 text-purple-700",
  };

  // Reset image selections
  const resetImages = () => {
    setExistingImages([]);
    setSelectedFiles([]);
  };

  // Open add modal
  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    resetImages();
    setError("");
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (property) => {
    setEditingId(property._id);

    setForm({
      title: property.title || "",
      description: property.description || "",
      propertyType: property.propertyType || "apartment",
      listingType: property.listingType || "sale",
      price: String(property.price || ""),
      area: String(property.area || ""),
      areaUnit: property.areaUnit || "sqft",
      bedrooms: String(property.bedrooms ?? 0),
      bathrooms: String(property.bathrooms ?? 0),
      status: property.status || "available",
      address: property.location?.address || "",
      city: property.location?.city || "",
      state: property.location?.state || "",
    });

    setExistingImages(property.images || []);
    setSelectedFiles([]);
    setError("");
    setShowModal(true);
  };

  // Handle form input
  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const validFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );

    if (validFiles.length !== files.length) {
      setError("Please select valid image files only.");
      e.target.value = "";
      return;
    }

    if (selectedFiles.length + validFiles.length > 10) {
      setError("You can upload a maximum of 10 new images at once.");
      e.target.value = "";
      return;
    }

    setError("");

    setSelectedFiles((prev) => [
      ...prev,
      ...validFiles,
    ]);

    // Allow selecting the same file again
    e.target.value = "";
  };

  // Remove an existing image
  const removeExistingImage = (index) => {
    setExistingImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // Remove a newly selected image
  const removeSelectedImage = (index) => {
    setSelectedFiles((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // Upload selected images to Cloudinary
  const uploadImages = async () => {
    if (!selectedFiles.length) {
      return [];
    }

    const response = await uploadPropertyImages(selectedFiles);

    const uploadedImages = response.images;

    if (!Array.isArray(uploadedImages)) {
      throw new Error(
        "Image upload response is invalid. Check the backend upload controller."
      );
    }

    return uploadedImages;
  };

  // Create or update property
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      let uploadedImages = [];

      if (selectedFiles.length > 0) {
        uploadedImages = await uploadImages();
      }

      const propertyData = {
        title: form.title.trim(),
        description: form.description.trim(),
        propertyType: form.propertyType,
        listingType: form.listingType,
        price: Number(form.price),
        area: Number(form.area),
        areaUnit: form.areaUnit,
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),

        location: {
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          country: "India",
        },

        // Existing images + newly uploaded Cloudinary images
        images: [
          ...existingImages,
          ...uploadedImages,
        ],
      };

      if (editingId) {
        propertyData.status = form.status;

        await updateProperty(editingId, propertyData);
      } else {
        await createProperty(propertyData);
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      resetImages();

      await fetchProperties();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save property."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete property
  const handleDelete = async (propertyId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this property?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteProperty(propertyId);

      setProperties((prev) =>
        prev.filter((property) => property._id !== propertyId)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete property."
      );
    }
  };

  // Summary statistics
  const summary = [
    {
      label: "Total Properties",
      value: properties.length,
    },
    {
      label: "Available",
      value: properties.filter(
        (property) => property.status === "available"
      ).length,
    },
    {
      label: "Pending Review",
      value: properties.filter(
        (property) => property.status === "pending"
      ).length,
    },
  ];

  return (
    <DashboardLayout role={user?.role || "agent"}>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Properties Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {isAdmin
              ? "Manage and monitor all property listings."
              : "Manage your property listings."}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          <Plus size={19} />
          Add Property
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>

          <button onClick={() => setError("")}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summary.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <p className="text-sm text-gray-500">
              {item.label}
            </p>

            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              {loading ? "..." : item.value}
            </h2>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search property or location..."
              className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-3 outline-none focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <SlidersHorizontal
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-3 outline-none focus:border-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="available">Available</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
            </select>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 outline-none focus:border-blue-500"
          >
            <option value="All">All Property Types</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="villa">Villa</option>
            <option value="plot">Plot</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
      </div>

      {/* Property Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Property Listings ({filteredProperties.length})
          </h2>

          <button
            onClick={fetchProperties}
            disabled={loading}
            title="Refresh properties"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-5 py-4 font-medium">Property</th>
                <th className="px-5 py-4 font-medium">Type</th>
                <th className="px-5 py-4 font-medium">Bedrooms</th>
                <th className="px-5 py-4 font-medium">Price</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 text-right font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-gray-500">
                    Loading properties...
                  </td>
                </tr>
              ) : filteredProperties.length > 0 ? (
                filteredProperties.map((property) => (
                  <tr
                    key={property._id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            property.images?.[0]?.url ||
                            "https://placehold.co/300x200?text=Property"
                          }
                          alt={property.title}
                          className="h-14 w-16 rounded-lg object-cover"
                        />

                        <div>
                          <p className="font-semibold text-gray-900">
                            {property.title}
                          </p>

                          <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                            <MapPin size={13} />
                            {formatLocation(property.location)}
                          </p>

                          {isAdmin && property.owner && (
                            <p className="mt-1 text-xs text-gray-400">
                              Owner: {property.owner.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 capitalize text-gray-600">
                      {property.propertyType}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {property.bedrooms}
                    </td>

                    <td className="px-5 py-4 font-medium text-gray-900">
                      {formatPrice(property.price)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          statusStyles[property.status] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {property.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          title="View property"
                          onClick={() =>
                            navigate(`/properties/${property._id}`)
                          }
                          className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          title="Edit property"
                          onClick={() => openEditModal(property)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          title="Delete property"
                          onClick={() => handleDelete(property._id)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-gray-500">
                    No properties found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? "Edit Property" : "Add New Property"}
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Property Title
                </label>

                <input
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  required
                  maxLength={150}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-blue-500"
                  placeholder="Enter property title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  required
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-blue-500"
                  placeholder="Describe the property"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Property Images
                </label>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-blue-500 hover:bg-blue-50">
                  <ImagePlus size={30} className="mb-2 text-gray-400" />

                  <span className="font-medium text-gray-700">
                    Click to select property images
                  </span>

                  <span className="mt-1 text-xs text-gray-500">
                    JPG, PNG, WEBP · Up to 10 new images
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {/* Existing and new image previews */}
                {(existingImages.length > 0 ||
                  selectedPreviews.length > 0) && (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {existingImages.map((image, index) => (
                      <div
                        key={image.publicId || image.url || index}
                        className="relative"
                      >
                        <img
                          src={image.url}
                          alt={`Existing property ${index + 1}`}
                          className="h-24 w-full rounded-lg object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                          title="Remove image"
                        >
                          <X size={14} />
                        </button>

                        <span className="mt-1 block text-center text-xs text-gray-500">
                          Existing
                        </span>
                      </div>
                    ))}

                    {selectedPreviews.map((preview, index) => (
                      <div key={preview} className="relative">
                        <img
                          src={preview}
                          alt={`New property ${index + 1}`}
                          className="h-24 w-full rounded-lg object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => removeSelectedImage(index)}
                          className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                          title="Remove image"
                        >
                          <X size={14} />
                        </button>

                        <span className="mt-1 block text-center text-xs text-blue-600">
                          New image
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Property Type and Listing Type */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Property Type
                  </label>

                  <select
                    name="propertyType"
                    value={form.propertyType}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3"
                  >
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="plot">Plot</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Listing Type
                  </label>

                  <select
                    name="listingType"
                    value={form.listingType}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3"
                  >
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>
              </div>

              {/* Price and Area */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Price (INR)
                  </label>

                  <input
                    type="number"
                    name="price"
                    min="1"
                    value={form.price}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-lg border border-gray-200 px-4 py-3"
                    placeholder="Price"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Area
                  </label>

                  <input
                    type="number"
                    name="area"
                    min="1"
                    value={form.area}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-lg border border-gray-200 px-4 py-3"
                    placeholder="Area"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Area Unit
                  </label>

                  <select
                    name="areaUnit"
                    value={form.areaUnit}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3"
                  >
                    <option value="sqft">Sq Ft</option>
                    <option value="sqm">Sq M</option>
                    <option value="acre">Acre</option>
                  </select>
                </div>
              </div>

              {/* Bedrooms and Bathrooms */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Bedrooms
                  </label>

                  <input
                    type="number"
                    name="bedrooms"
                    min="0"
                    value={form.bedrooms}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Bathrooms
                  </label>

                  <input
                    type="number"
                    name="bathrooms"
                    min="0"
                    value={form.bathrooms}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Address
                </label>

                <input
                  name="address"
                  value={form.address}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded-lg border border-gray-200 px-4 py-3"
                  placeholder="Enter property address"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    City
                  </label>

                  <input
                    name="city"
                    value={form.city}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-lg border border-gray-200 px-4 py-3"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    State
                  </label>

                  <input
                    name="state"
                    value={form.state}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-lg border border-gray-200 px-4 py-3"
                    placeholder="Enter state"
                  />
                </div>
              </div>

              {/* Status - Edit only */}
              {editingId && (
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Property Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3"
                  >
                    <option value="available">Available</option>
                    <option value="pending">Pending</option>
                    <option value="sold">Sold</option>
                    <option value="rented">Rented</option>
                  </select>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="rounded-lg border border-gray-200 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Uploading & Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Add Property"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default PropertiesManagement;
