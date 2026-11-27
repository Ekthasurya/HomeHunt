
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  CalendarDays,
  Clock,
  MapPin,
  Eye,
  CheckCircle,
  XCircle,
  X,
  Filter,
  RefreshCw,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import {
  getMyVisits,
  updateVisitStatus,
} from "../../services/api/visitApi";

const statusStyles = {
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  completed: "bg-blue-50 text-blue-700",
  cancelled: "bg-gray-100 text-gray-600",
};

function VisitsManagement() {
  const [visits, setVisits] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [agentNote, setAgentNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch visits from backend
  const fetchVisits = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyVisits();

      const formattedVisits = (response.visits || []).map((visit) => ({
        id: visit._id,
        buyer: visit.buyer?.name || "Unknown Buyer",
        email: visit.buyer?.email || "No email",
        property: visit.property?.title || "Property",
        location: [
          visit.property?.location?.city,
          visit.property?.location?.state,
        ]
          .filter(Boolean)
          .join(", ") ||
          visit.property?.location?.address ||
          "Location unavailable",
        date: visit.visitDate,
        time: visit.visitTime,
        status: visit.status,
        agent: visit.agent?.name || "Agent",
        message: visit.message || "",
        agentNote: visit.agentNote || "",
        raw: visit,
      }));

      setVisits(formattedVisits);
    } catch (err) {
      console.error("Fetch Visits Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load visit requests."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  // Search and status filter
  const filteredVisits = useMemo(() => {
    return visits.filter((visit) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        visit.buyer.toLowerCase().includes(searchText) ||
        visit.property.toLowerCase().includes(searchText) ||
        visit.location.toLowerCase().includes(searchText) ||
        visit.email.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" || visit.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [visits, search, statusFilter]);

  // Statistics
  const stats = [
    {
      label: "Total Visits",
      value: visits.length,
      color: "text-blue-600 bg-blue-50",
      icon: CalendarDays,
    },
    {
      label: "Pending Requests",
      value: visits.filter((v) => v.status === "pending").length,
      color: "text-yellow-600 bg-yellow-50",
      icon: Clock,
    },
    {
      label: "Confirmed",
      value: visits.filter((v) => v.status === "confirmed").length,
      color: "text-green-600 bg-green-50",
      icon: CheckCircle,
    },
    {
      label: "Completed",
      value: visits.filter((v) => v.status === "completed").length,
      color: "text-purple-600 bg-purple-50",
      icon: CalendarDays,
    },
  ];

  // Update visit status through backend
  const handleUpdateStatus = async (visit, status) => {
    try {
      setUpdatingId(visit.id);
      setError("");

      const response = await updateVisitStatus(
        visit.id,
        status,
        agentNote
      );

      const updatedVisit = response.visit;

      setVisits((prev) =>
        prev.map((item) =>
          item.id === visit.id
            ? {
                ...item,
                status: updatedVisit?.status || status,
                agentNote:
                  updatedVisit?.agentNote ?? agentNote,
                raw: updatedVisit || item.raw,
              }
            : item
        )
      );

      if (selectedVisit?.id === visit.id) {
        setSelectedVisit((prev) =>
          prev
            ? {
                ...prev,
                status: updatedVisit?.status || status,
                agentNote:
                  updatedVisit?.agentNote ?? agentNote,
                raw: updatedVisit || prev.raw,
              }
            : null
        );
      }

      setAgentNote(updatedVisit?.agentNote ?? agentNote);
    } catch (err) {
      console.error("Update Visit Status Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update visit status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Date formatting
  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Open details modal
  const openDetails = (visit) => {
    setSelectedVisit(visit);
    setAgentNote(visit.agentNote || "");
  };

  // Close details modal
  const closeDetails = () => {
    setSelectedVisit(null);
    setAgentNote("");
  };

  return (
    <DashboardLayout role="agent">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Visits Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage property visit requests and appointments.
          </p>
        </div>

        <button
          onClick={fetchVisits}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {stat.label}
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-gray-900">
                    {stat.value}
                  </h2>
                </div>

                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>

          <button
            onClick={fetchVisits}
            className="font-medium underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search buyer, property or location..."
              className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-3 outline-none focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <Filter
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-3 outline-none focus:border-blue-500"
            >
              <option value="All">All Visit Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visits Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Visit Requests ({filteredVisits.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-5 py-4 font-medium">Buyer</th>
                <th className="px-5 py-4 font-medium">Property</th>
                <th className="px-5 py-4 font-medium">Visit Date</th>
                <th className="px-5 py-4 font-medium">Time</th>
                <th className="px-5 py-4 font-medium">Agent</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 text-right font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center">
                    <RefreshCw
                      size={24}
                      className="mx-auto animate-spin text-gray-400"
                    />
                    <p className="mt-3 text-gray-500">
                      Loading visits...
                    </p>
                  </td>
                </tr>
              ) : filteredVisits.length > 0 ? (
                filteredVisits.map((visit) => (
                  <tr
                    key={visit.id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">
                        {visit.buyer}
                      </p>

                      <p className="text-xs text-gray-500">
                        {visit.email}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">
                        {visit.property}
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={13} />
                        {visit.location}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {formatDate(visit.date)}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {visit.time}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {visit.agent}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                          statusStyles[visit.status] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {visit.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          title="View details"
                          onClick={() => openDetails(visit)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye size={17} />
                        </button>

                        {visit.status === "pending" && (
                          <>
                            <button
                              title="Confirm"
                              disabled={updatingId === visit.id}
                              onClick={() =>
                                handleUpdateStatus(
                                  visit,
                                  "confirmed"
                                )
                              }
                              className="rounded-lg p-2 text-green-600 hover:bg-green-50 disabled:opacity-50"
                            >
                              <CheckCircle size={17} />
                            </button>

                            <button
                              title="Reject"
                              disabled={updatingId === visit.id}
                              onClick={() =>
                                handleUpdateStatus(
                                  visit,
                                  "rejected"
                                )
                              }
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              <XCircle size={17} />
                            </button>
                          </>
                        )}

                        {visit.status === "confirmed" && (
                          <button
                            title="Mark completed"
                            disabled={updatingId === visit.id}
                            onClick={() =>
                              handleUpdateStatus(
                                visit,
                                "completed"
                              )
                            }
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                          >
                            <CheckCircle size={17} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    {visits.length === 0
                      ? "No visit requests available yet."
                      : "No visit requests found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visit Details Modal */}
      {selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            {/* Modal Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Visit Details
              </h2>

              <button
                onClick={closeDetails}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Details */}
            <div className="space-y-5">
              <div>
                <p className="text-sm text-gray-500">Buyer</p>

                <p className="mt-1 font-semibold text-gray-900">
                  {selectedVisit.buyer}
                </p>

                <p className="text-sm text-gray-500">
                  {selectedVisit.email}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Property</p>

                <p className="mt-1 font-semibold text-gray-900">
                  {selectedVisit.property}
                </p>

                <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                  <MapPin size={15} />
                  {selectedVisit.location}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Visit Date</p>

                  <p className="mt-1 font-medium">
                    {formatDate(selectedVisit.date)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Visit Time</p>

                  <p className="mt-1 font-medium">
                    {selectedVisit.time}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Assigned Agent</p>

                <p className="mt-1 font-medium">
                  {selectedVisit.agent}
                </p>
              </div>

              {/* Buyer Message */}
              {selectedVisit.message && (
                <div>
                  <p className="text-sm text-gray-500">
                    Buyer Message
                  </p>

                  <p className="mt-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                    {selectedVisit.message}
                  </p>
                </div>
              )}

              {/* Status */}
              <div>
                <p className="text-sm text-gray-500">Status</p>

                <span
                  className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${
                    statusStyles[selectedVisit.status]
                  }`}
                >
                  {selectedVisit.status}
                </span>
              </div>

              {/* Agent Note */}
              <div>
                <label
                  htmlFor="agentNote"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Agent Note
                </label>

                <textarea
                  id="agentNote"
                  rows={3}
                  maxLength={500}
                  value={agentNote}
                  onChange={(e) => setAgentNote(e.target.value)}
                  placeholder="Add a note for the buyer..."
                  disabled={
                    ["rejected", "completed", "cancelled"].includes(
                      selectedVisit.status
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Maximum 500 characters.
                </p>
              </div>

              {/* Existing Agent Note */}
              {selectedVisit.agentNote && (
                <div className="rounded-lg bg-green-50 p-3">
                  <p className="text-sm font-medium text-green-800">
                    Saved Agent Note
                  </p>

                  <p className="mt-1 text-sm text-green-700">
                    {selectedVisit.agentNote}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-7 flex flex-wrap justify-end gap-3">
              {selectedVisit.status === "pending" && (
                <>
                  <button
                    disabled={updatingId === selectedVisit.id}
                    onClick={() =>
                      handleUpdateStatus(
                        selectedVisit,
                        "rejected"
                      )
                    }
                    className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Reject
                  </button>

                  <button
                    disabled={updatingId === selectedVisit.id}
                    onClick={() =>
                      handleUpdateStatus(
                        selectedVisit,
                        "confirmed"
                      )
                    }
                    className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {updatingId === selectedVisit.id
                      ? "Updating..."
                      : "Confirm Visit"}
                  </button>
                </>
              )}

              {selectedVisit.status === "confirmed" && (
                <button
                  disabled={updatingId === selectedVisit.id}
                  onClick={() =>
                    handleUpdateStatus(
                      selectedVisit,
                      "completed"
                    )
                  }
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {updatingId === selectedVisit.id
                    ? "Updating..."
                    : "Mark Completed"}
                </button>
              )}

              {/* Save note without changing status */}
              {["confirmed"].includes(selectedVisit.status) && (
                <button
                  disabled={updatingId === selectedVisit.id}
                  onClick={() =>
                    handleUpdateStatus(
                      selectedVisit,
                      "confirmed"
                    )
                  }
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Save Note
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default VisitsManagement;
