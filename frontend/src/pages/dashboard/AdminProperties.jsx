
import { useEffect, useState } from "react";
import {
  Search,
  Building2,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  getAdminProperties,
  updatePropertyApproval,
  updatePropertyVerification,
  updatePropertyStatus,
  updatePropertyFeatured,
} from "../../services/api/adminPropertyApi";

function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({
    totalProperties: 0,
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
  });

  const [search, setSearch] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [listingType, setListingType] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);

      const response = await getAdminProperties({
        search,
        propertyType,
        listingType,
        approvalStatus,
        status,
        page,
        limit: 10,
      });

      setProperties(response.properties || []);
      setPagination(
        response.pagination || {
          totalProperties: 0,
          currentPage: 1,
          totalPages: 1,
          pageSize: 10,
        }
      );
    } catch (error) {
      console.error("Fetch Admin Properties Error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to fetch properties."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [
    search,
    propertyType,
    listingType,
    approvalStatus,
    status,
    page,
  ]);

  const refreshProperties = () => {
    fetchProperties();
  };

  const handleApproval = async (propertyId, nextStatus) => {
    let rejectionReason = "";

    if (nextStatus === "rejected") {
      rejectionReason = window.prompt(
        "Enter the reason for rejecting this property:"
      );

      if (!rejectionReason || !rejectionReason.trim()) {
        return;
      }
    } else {
      if (!window.confirm("Approve this property?")) {
        return;
      }
    }

    try {
      setActionLoading(propertyId);

      await updatePropertyApproval(
        propertyId,
        nextStatus,
        rejectionReason
      );

      alert(`Property ${nextStatus} successfully.`);
      await fetchProperties();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to update property approval."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerification = async (property) => {
    try {
      setActionLoading(property._id);

      await updatePropertyVerification(
        property._id,
        !property.isVerified
      );

      await fetchProperties();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to update verification."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleFeatured = async (property) => {
    try {
      setActionLoading(property._id);

      await updatePropertyFeatured(
        property._id,
        !property.isFeatured
      );

      await fetchProperties();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to update featured status."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (propertyId, nextStatus) => {
    try {
      setActionLoading(propertyId);

      await updatePropertyStatus(propertyId, nextStatus);

      await fetchProperties();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to update property status."
      );

      await fetchProperties();
    } finally {
      setActionLoading(null);
    }
  };

  const getApprovalBadge = (approvalStatus) => {
    const value = approvalStatus || "approved";

    const styles = {
      approved: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      rejected: "bg-red-100 text-red-700",
    };

    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
          styles[value] || "bg-gray-100 text-gray-700"
        }`}
      >
        {value}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      available: "bg-green-100 text-green-700",
      sold: "bg-blue-100 text-blue-700",
      rented: "bg-purple-100 text-purple-700",
      pending: "bg-yellow-100 text-yellow-700",
    };

    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
          styles[status] || "bg-gray-100 text-gray-700"
        }`}
      >
        {status}
      </span>
    );
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) {
      return "N/A";
    }

    return `₹${Number(price).toLocaleString("en-IN")}`;
  };

  const clearFilters = () => {
    setSearch("");
    setPropertyType("");
    setListingType("");
    setApprovalStatus("");
    setStatus("");
    setPage(1);
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Property Management
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage, approve and verify property listings.
            </p>
          </div>

          <button
            onClick={refreshProperties}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Total Properties */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <Building2 size={24} />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Total Properties
              </p>

              <h2 className="text-2xl font-bold text-gray-800">
                {pagination.totalProperties}
              </h2>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="font-semibold text-gray-800">
              Search and Filters
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {/* Search */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search title or location..."
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            {/* Property Type */}
            <select
              value={propertyType}
              onChange={(e) => {
                setPropertyType(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All Property Types</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
              <option value="plot">Plot</option>
              <option value="commercial">Commercial</option>
            </select>

            {/* Listing Type */}
            <select
              value={listingType}
              onChange={(e) => {
                setListingType(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All Listing Types</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>

            {/* Approval Status */}
            <select
              value={approvalStatus}
              onChange={(e) => {
                setApprovalStatus(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All Approval Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Availability */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All Availability</option>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
              <option value="pending">Pending</option>
            </select>

            <button
              onClick={clearFilters}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Properties Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800">
              All Properties
            </h2>
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <Loader2
                size={32}
                className="animate-spin text-blue-600"
              />
            </div>
          ) : properties.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
              <Building2 size={42} className="mb-3 text-gray-300" />

              <h3 className="font-semibold text-gray-700">
                No properties found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1250px] text-left text-sm">

                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-5 py-4">Property</th>
                      <th className="px-5 py-4">Owner</th>
                      <th className="px-5 py-4">Price</th>
                      <th className="px-5 py-4">Approval</th>
                      <th className="px-5 py-4">Availability</th>
                      <th className="px-5 py-4">Verification</th>
                      <th className="px-5 py-4">Featured</th>
                      <th className="px-5 py-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {properties.map((property) => {
                      const isBusy =
                        actionLoading === property._id;

                      return (
                        <tr
                          key={property._id}
                          className="hover:bg-gray-50"
                        >

                          {/* Property */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {property.images?.[0]?.url ? (
                                <img
                                  src={property.images[0].url}
                                  alt={property.title}
                                  className="h-14 w-16 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="flex h-14 w-16 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                                  <Building2 size={22} />
                                </div>
                              )}

                              <div className="max-w-52">
                                <p className="font-semibold text-gray-800">
                                  {property.title}
                                </p>

                                <p className="mt-1 text-xs capitalize text-gray-500">
                                  {property.propertyType} ·{" "}
                                  {property.listingType}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                  {property.location?.city || "N/A"},{" "}
                                  {property.location?.state || ""}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Owner */}
                          <td className="px-5 py-4">
                            <p className="font-medium text-gray-700">
                              {property.owner?.name || "Unknown"}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {property.owner?.email || "N/A"}
                            </p>
                          </td>

                          {/* Price */}
                          <td className="px-5 py-4 font-semibold text-gray-800">
                            {formatPrice(property.price)}
                          </td>

                          {/* Approval */}
                          <td className="px-5 py-4">
                            {getApprovalBadge(
                              property.approvalStatus
                            )}
                          </td>

                          {/* Availability */}
                          <td className="px-5 py-4">
                            <select
                              value={property.status}
                              disabled={isBusy}
                              onChange={(e) =>
                                handleStatusChange(
                                  property._id,
                                  e.target.value
                                )
                              }
                              className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs capitalize outline-none"
                            >
                              <option value="available">
                                Available
                              </option>
                              <option value="sold">Sold</option>
                              <option value="rented">Rented</option>
                              <option value="pending">Pending</option>
                            </select>
                          </td>

                          {/* Verification */}
                          <td className="px-5 py-4">
                            <button
                              disabled={isBusy}
                              onClick={() =>
                                handleVerification(property)
                              }
                              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium disabled:opacity-50 ${
                                property.isVerified
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              <ShieldCheck size={14} />

                              {property.isVerified
                                ? "Verified"
                                : "Verify"}
                            </button>
                          </td>

                          {/* Featured */}
                          <td className="px-5 py-4">
                            <button
                              disabled={isBusy}
                              onClick={() =>
                                handleFeatured(property)
                              }
                              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium disabled:opacity-50 ${
                                property.isFeatured
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              <Star size={14} />

                              {property.isFeatured
                                ? "Featured"
                                : "Feature"}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4">
                            {isBusy ? (
                              <Loader2
                                size={20}
                                className="animate-spin text-blue-600"
                              />
                            ) : property.approvalStatus === "pending" ? (
                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={() =>
                                    handleApproval(
                                      property._id,
                                      "approved"
                                    )
                                  }
                                  className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
                                >
                                  <CheckCircle size={14} />
                                  Approve
                                </button>

                                <button
                                  onClick={() =>
                                    handleApproval(
                                      property._id,
                                      "rejected"
                                    )
                                  }
                                  className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
                                >
                                  <XCircle size={14} />
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">
                                No pending action
                              </span>
                            )}
                          </td>

                        </tr>
                      );
                    })}

                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 px-5 py-4 sm:flex-row">

                <p className="text-sm text-gray-500">
                  Showing{" "}
                  {properties.length > 0
                    ? (page - 1) * 10 + 1
                    : 0}{" "}
                  to {(page - 1) * 10 + properties.length} of{" "}
                  {pagination.totalProperties} properties
                </p>

                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((prev) => prev - 1)}
                    className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <span className="px-3 text-sm font-medium text-gray-700">
                    Page {pagination.currentPage || page} of{" "}
                    {Math.max(1, pagination.totalPages)}
                  </span>

                  <button
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                    className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminProperties;
