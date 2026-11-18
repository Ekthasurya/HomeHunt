
import { useMemo, useState } from "react";
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
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";

const initialVisits = [
  {
    id: 1,
    buyer: "Rahul Sharma",
    email: "rahul@gmail.com",
    property: "Luxury Modern Apartment",
    location: "New Town, Kolkata",
    date: "2026-11-20",
    time: "10:00 AM",
    status: "Pending",
    agent: "Priya Das",
  },
  {
    id: 2,
    buyer: "Amit Roy",
    email: "amit@gmail.com",
    property: "Premium Family Villa",
    location: "Salt Lake, Kolkata",
    date: "2026-11-21",
    time: "02:00 PM",
    status: "Approved",
    agent: "Sneha Gupta",
  },
  {
    id: 3,
    buyer: "Sneha Patel",
    email: "sneha@gmail.com",
    property: "Modern Garden Villa",
    location: "New Town, Kolkata",
    date: "2026-11-22",
    time: "11:30 AM",
    status: "Pending",
    agent: "Priya Das",
  },
  {
    id: 4,
    buyer: "Arjun Singh",
    email: "arjun@gmail.com",
    property: "Affordable Family House",
    location: "Howrah, Kolkata",
    date: "2026-11-18",
    time: "04:00 PM",
    status: "Completed",
    agent: "Rahul Das",
  },
  {
    id: 5,
    buyer: "Priya Roy",
    email: "priya@gmail.com",
    property: "Luxury City Penthouse",
    location: "Bandra, Mumbai",
    date: "2026-11-23",
    time: "12:00 PM",
    status: "Rejected",
    agent: "Sneha Gupta",
  },
];

const statusStyles = {
  Pending: "bg-yellow-50 text-yellow-700",
  Approved: "bg-green-50 text-green-700",
  Rejected: "bg-red-50 text-red-700",
  Completed: "bg-blue-50 text-blue-700",
};

function VisitsManagement() {
  const [visits, setVisits] = useState(initialVisits);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedVisit, setSelectedVisit] = useState(null);

  const filteredVisits = useMemo(() => {
    return visits.filter((visit) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        visit.buyer.toLowerCase().includes(searchText) ||
        visit.property.toLowerCase().includes(searchText) ||
        visit.location.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" || visit.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [visits, search, statusFilter]);

  const stats = [
    {
      label: "Total Visits",
      value: visits.length,
      color: "text-blue-600 bg-blue-50",
      icon: CalendarDays,
    },
    {
      label: "Pending Requests",
      value: visits.filter((v) => v.status === "Pending").length,
      color: "text-yellow-600 bg-yellow-50",
      icon: Clock,
    },
    {
      label: "Approved",
      value: visits.filter((v) => v.status === "Approved").length,
      color: "text-green-600 bg-green-50",
      icon: CheckCircle,
    },
    {
      label: "Completed",
      value: visits.filter((v) => v.status === "Completed").length,
      color: "text-purple-600 bg-purple-50",
      icon: CalendarDays,
    },
  ];

  const updateStatus = (id, status) => {
    setVisits((prev) =>
      prev.map((visit) =>
        visit.id === id ? { ...visit, status } : visit
      )
    );

    setSelectedVisit((prev) =>
      prev?.id === id ? { ...prev, status } : prev
    );
  };

  const formatDate = (date) =>
    new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <DashboardLayout role="admin">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Visits Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage property visit requests and appointments.
        </p>
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
                  <p className="text-sm text-gray-500">{stat.label}</p>
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
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed</option>
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
                <th className="px-5 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredVisits.length > 0 ? (
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
                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[visit.status]}`}
                      >
                        {visit.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          title="View details"
                          onClick={() => setSelectedVisit(visit)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye size={17} />
                        </button>

                        {visit.status === "Pending" && (
                          <>
                            <button
                              title="Approve"
                              onClick={() =>
                                updateStatus(visit.id, "Approved")
                              }
                              className="rounded-lg p-2 text-green-600 hover:bg-green-50"
                            >
                              <CheckCircle size={17} />
                            </button>

                            <button
                              title="Reject"
                              onClick={() =>
                                updateStatus(visit.id, "Rejected")
                              }
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            >
                              <XCircle size={17} />
                            </button>
                          </>
                        )}

                        {visit.status === "Approved" && (
                          <button
                            title="Mark completed"
                            onClick={() =>
                              updateStatus(visit.id, "Completed")
                            }
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
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
                    No visit requests found.
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
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Visit Details
              </h2>

              <button
                onClick={() => setSelectedVisit(null)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

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

              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${statusStyles[selectedVisit.status]}`}
                >
                  {selectedVisit.status}
                </span>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap justify-end gap-3">
              {selectedVisit.status === "Pending" && (
                <>
                  <button
                    onClick={() => updateStatus(selectedVisit.id, "Rejected")}
                    className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Reject
                  </button>

                  <button
                    onClick={() => updateStatus(selectedVisit.id, "Approved")}
                    className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700"
                  >
                    Approve Visit
                  </button>
                </>
              )}

              {selectedVisit.status === "Approved" && (
                <button
                  onClick={() => updateStatus(selectedVisit.id, "Completed")}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Mark Completed
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
