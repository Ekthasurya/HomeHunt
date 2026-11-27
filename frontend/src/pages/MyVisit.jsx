
import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  RefreshCw,
  XCircle,
  Home,
} from "lucide-react";

import {
  getMyVisits,
  cancelVisit,
} from "../services/api/visitApi";

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
  completed: "bg-blue-100 text-blue-700",
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function MyVisit() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const fetchVisits = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyVisits();

      setVisits(response.visits || []);
    } catch (err) {
      console.error("Fetch Visits Error:", err);

      setError(
        err.response?.data?.message || "Unable to load your visits."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const handleCancelVisit = async (visitId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this visit?"
    );

    if (!confirmed) return;

    try {
      setCancellingId(visitId);

      await cancelVisit(visitId);

      setVisits((previousVisits) =>
        previousVisits.map((visit) =>
          visit._id === visitId
            ? { ...visit, status: "cancelled" }
            : visit
        )
      );
    } catch (err) {
      console.error("Cancel Visit Error:", err);

      alert(
        err.response?.data?.message || "Unable to cancel this visit."
      );
    } finally {
      setCancellingId(null);
    }
  };

  const pendingCount = visits.filter(
    (visit) => visit.status === "pending"
  ).length;

  const confirmedCount = visits.filter(
    (visit) => visit.status === "confirmed"
  ).length;

  const completedCount = visits.filter(
    (visit) => visit.status === "completed"
  ).length;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-green-700 mx-auto" />
          <p className="mt-3 text-gray-500">Loading your visits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            My Property Visits
          </h1>
          <p className="text-gray-500 mt-2">
            Manage and track your scheduled property visits.
          </p>
        </div>

        <button
          onClick={fetchVisits}
          className="flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-gray-500">Total Visits</p>
          <h2 className="text-2xl font-bold mt-2">{visits.length}</h2>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-gray-500">Pending</p>
          <h2 className="text-2xl font-bold text-yellow-600 mt-2">
            {pendingCount}
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-gray-500">Confirmed</p>
          <h2 className="text-2xl font-bold text-green-600 mt-2">
            {confirmedCount}
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-gray-500">Completed</p>
          <h2 className="text-2xl font-bold text-blue-600 mt-2">
            {completedCount}
          </h2>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          {error}
          <button
            onClick={fetchVisits}
            className="ml-3 underline font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!error && visits.length === 0 && (
        <div className="bg-white border rounded-xl p-10 text-center">
          <CalendarDays className="w-12 h-12 text-gray-400 mx-auto" />

          <h2 className="text-xl font-semibold mt-4">
            No Visits Scheduled
          </h2>

          <p className="text-gray-500 mt-2">
            Your scheduled property visits will appear here.
          </p>
        </div>
      )}

      {/* Visit Cards */}
      <div className="space-y-5">
        {visits.map((visit) => {
          const property = visit.property;
          const image = property?.images?.[0]?.url ||
            property?.images?.[0] ||
            "";

          return (
            <div
              key={visit._id}
              className="bg-white border rounded-xl overflow-hidden shadow-sm"
            >
              <div className="flex flex-col md:flex-row">
                {/* Property Image */}
                <div className="md:w-64 h-52 md:h-auto bg-gray-100 shrink-0">
                  {image ? (
                    <img
                      src={image}
                      alt={property?.title || "Property"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Visit Information */}
                <div className="flex-1 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {property?.title || "Property"}
                      </h2>

                      <p className="text-gray-500 text-sm mt-2 flex items-center gap-1">
                        <MapPin size={15} />
                        {property?.location?.city || "Location unavailable"}
                        {property?.location?.state
                          ? `, ${property.location.state}`
                          : ""}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        statusStyles[visit.status] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {visit.status}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="text-green-700" size={20} />
                      <div>
                        <p className="text-xs text-gray-500">Visit Date</p>
                        <p className="text-sm font-medium">
                          {formatDate(visit.visitDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="text-green-700" size={20} />
                      <div>
                        <p className="text-xs text-gray-500">Visit Time</p>
                        <p className="text-sm font-medium">
                          {visit.visitTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <User className="text-green-700" size={20} />
                      <div>
                        <p className="text-xs text-gray-500">Agent</p>
                        <p className="text-sm font-medium">
                          {visit.agent?.name || "Agent"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {visit.message && (
                    <div className="mt-5">
                      <p className="text-xs text-gray-500 mb-1">
                        Your Message
                      </p>
                      <p className="text-sm text-gray-700">
                        {visit.message}
                      </p>
                    </div>
                  )}

                  {visit.agentNote && (
                    <div className="mt-4 bg-green-50 p-3 rounded-lg">
                      <p className="text-xs font-semibold text-green-800">
                        Agent Note
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        {visit.agentNote}
                      </p>
                    </div>
                  )}

                  {/* Cancel Visit */}
                  {["pending", "confirmed"].includes(visit.status) && (
                    <div className="mt-5">
                      <button
                        onClick={() => handleCancelVisit(visit._id)}
                        disabled={cancellingId === visit._id}
                        className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                      >
                        <XCircle size={17} />
                        {cancellingId === visit._id
                          ? "Cancelling..."
                          : "Cancel Visit"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
