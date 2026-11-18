
import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  SlidersHorizontal,
  MapPin,
  Pencil,
  Trash2,
  Eye,
  X,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";

const initialProperties = [
  {
    id: 1,
    title: "Luxury Modern Apartment",
    location: "New Town, Kolkata",
    type: "Apartment",
    price: 8500000,
    status: "Approved",
    bedrooms: 3,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300",
  },
  {
    id: 2,
    title: "Premium Family Villa",
    location: "Whitefield, Bangalore",
    type: "Villa",
    price: 12500000,
    status: "Pending",
    bedrooms: 4,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=300",
  },
  {
    id: 3,
    title: "Affordable Family House",
    location: "Salt Lake, Kolkata",
    type: "House",
    price: 6500000,
    status: "Approved",
    bedrooms: 2,
    image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=300",
  },
  {
    id: 4,
    title: "Luxury City Penthouse",
    location: "Bandra, Mumbai",
    type: "Apartment",
    price: 22000000,
    status: "Rejected",
    bedrooms: 4,
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=300",
  },
  {
    id: 5,
    title: "Modern Garden Villa",
    location: "Sector 62, Noida",
    type: "Villa",
    price: 15000000,
    status: "Approved",
    bedrooms: 5,
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=300",
  },
];

const emptyForm = {
  title: "",
  location: "",
  type: "Apartment",
  price: "",
  bedrooms: "2",
  status: "Pending",
};

function PropertiesManagement() {
  const [properties, setProperties] = useState(initialProperties);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesSearch =
        property.title.toLowerCase().includes(search.toLowerCase()) ||
        property.location.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || property.status === statusFilter;

      const matchesType =
        typeFilter === "All" || property.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [properties, search, statusFilter, typeFilter]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (property) => {
    setEditingId(property.id);
    setForm({
      title: property.title,
      location: property.location,
      type: property.type,
      price: String(property.price),
      bedrooms: String(property.bedrooms),
      status: property.status,
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const propertyData = {
      ...form,
      price: Number(form.price),
      bedrooms: Number(form.bedrooms),
    };

    if (editingId !== null) {
      setProperties((prev) =>
        prev.map((property) =>
          property.id === editingId
            ? { ...property, ...propertyData }
            : property
        )
      );
    } else {
      setProperties((prev) => [
        {
          id: Date.now(),
          ...propertyData,
          image:
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300",
        },
        ...prev,
      ]);
    }

    setShowModal(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this property?"
    );

    if (confirmed) {
      setProperties((prev) =>
        prev.filter((property) => property.id !== id)
      );
    }
  };

  const statusStyles = {
    Approved: "bg-green-50 text-green-700",
    Pending: "bg-yellow-50 text-yellow-700",
    Rejected: "bg-red-50 text-red-700",
  };

  return (
    <DashboardLayout role="admin">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Properties Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor all property listings.
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

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Properties", value: properties.length },
          {
            label: "Approved",
            value: properties.filter((p) => p.status === "Approved").length,
          },
          {
            label: "Pending Review",
            value: properties.filter((p) => p.status === "Pending").length,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <p className="text-sm text-gray-500">{item.label}</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              {item.value}
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
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 outline-none focus:border-blue-500"
          >
            <option value="All">All Property Types</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="House">House</option>
          </select>
        </div>
      </div>

      {/* Property Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Property Listings ({filteredProperties.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-5 py-4 font-medium">Property</th>
                <th className="px-5 py-4 font-medium">Type</th>
                <th className="px-5 py-4 font-medium">Bedrooms</th>
                <th className="px-5 py-4 font-medium">Price</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProperties.length > 0 ? (
                filteredProperties.map((property) => (
                  <tr
                    key={property.id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={property.image}
                          alt={property.title}
                          className="h-14 w-16 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {property.title}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                            <MapPin size={13} />
                            {property.location}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {property.type}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {property.bedrooms}
                    </td>

                    <td className="px-5 py-4 font-medium text-gray-900">
                      {formatPrice(property.price)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[property.status]}`}
                      >
                        {property.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          title="View property"
                          className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                          onClick={() =>
                            window.alert(`Property: ${property.title}`)
                          }
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
                          onClick={() => handleDelete(property.id)}
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
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    No properties found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId !== null ? "Edit Property" : "Add New Property"}
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Property Title
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-blue-500"
                  placeholder="Enter property title"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Location
                </label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-blue-500"
                  placeholder="Enter location"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Property Type
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3"
                  >
                    <option>Apartment</option>
                    <option>Villa</option>
                    <option>House</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    min="1"
                    value={form.bedrooms}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-lg border border-gray-200 px-4 py-3"
                  />
                </div>
              </div>

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
                  placeholder="Enter price"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Listing Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3"
                >
                  <option>Pending</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-200 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
                >
                  {editingId !== null ? "Save Changes" : "Add Property"}
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
