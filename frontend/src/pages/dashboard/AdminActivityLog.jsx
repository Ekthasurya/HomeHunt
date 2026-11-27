
import { useEffect, useState } from "react";

import {
  Activity,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
  Building2,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Star,
  RotateCcw,
  Trash2,
  UserCheck,
  UserX,
  Clock,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";

import { getAdminActivities } from "../../services/api/adminActivityApi";

function AdminActivityLog() {
  const [activities, setActivities] = useState([]);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [action, setAction] = useState("");
  const [targetType, setTargetType] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminActivities({
        action,
        targetType,
        page,
        limit: 10,
      });

      setActivities(response.activities || []);

      setPagination(
        response.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1,
        }
      );
    } catch (err) {
      console.error("Fetch Admin Activities Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to fetch admin activities."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [action, targetType, page]);

  const clearFilters = () => {
    setAction("");
    setTargetType("");
    setPage(1);
  };

  const getActionDetails = (activityAction) => {
    const actions = {
      approve_property: {
        label: "Property Approved",
        color: "bg-green-100 text-green-700",
        icon: CheckCircle,
      },
      reject_property: {
        label: "Property Rejected",
        color: "bg-red-100 text-red-700",
        icon: XCircle,
      },
      verify_property: {
        label: "Property Verified",
        color: "bg-blue-100 text-blue-700",
        icon: ShieldCheck,
      },
      unverify_property: {
        label: "Property Unverified",
        color: "bg-gray-100 text-gray-700",
        icon: ShieldCheck,
      },
      feature_property: {
        label: "Property Featured",
        color: "bg-yellow-100 text-yellow-700",
        icon: Star,
      },
      unfeature_property: {
        label: "Property Unfeatured",
        color: "bg-gray-100 text-gray-700",
        icon: Star,
      },
      update_property_status: {
        label: "Property Status Updated",
        color: "bg-purple-100 text-purple-700",
        icon: Building2,
      },
      activate_user: {
        label: "User Activated",
        color: "bg-green-100 text-green-700",
        icon: UserCheck,
      },
      deactivate_user: {
        label: "User Deactivated",
        color: "bg-orange-100 text-orange-700",
        icon: UserX,
      },
      delete_user: {
        label: "User Deleted",
        color: "bg-red-100 text-red-700",
        icon: Trash2,
      },
      restore_user: {
        label: "User Restored",
        color: "bg-blue-100 text-blue-700",
        icon: RotateCcw,
      },
    };

    return (
      actions[activityAction] || {
        label: activityAction?.replace(/_/g, " ") || "Unknown Action",
        color: "bg-gray-100 text-gray-700",
        icon: Activity,
      }
    );
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTargetDetails = (activity) => {
    if (activity.targetType === "Property") {
      return {
        label: "Property",
        name: activity.metadata?.propertyTitle || "Property",
        icon: Building2,
      };
    }

    return {
      label: "User",
      name:
        activity.metadata?.userName ||
        "User",
      icon: User,
    };
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Admin Activity Log
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Track administrative actions performed across HomeHunt.
            </p>
          </div>

          <button
            onClick={fetchActivities}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Total Activities */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <Activity size={24} />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Total Activities
              </p>

              <h2 className="text-2xl font-bold text-gray-800">
                {pagination.total}
              </h2>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-800">
            Search and Filters
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <select
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All Actions</option>
              <option value="approve_property">Property Approved</option>
              <option value="reject_property">Property Rejected</option>
              <option value="verify_property">Property Verified</option>
              <option value="unverify_property">Property Unverified</option>
              <option value="feature_property">Property Featured</option>
              <option value="unfeature_property">Property Unfeatured</option>
              <option value="update_property_status">Property Status Updated</option>
              <option value="activate_user">User Activated</option>
              <option value="deactivate_user">User Deactivated</option>
              <option value="delete_user">User Deleted</option>
              <option value="restore_user">User Restored</option>
            </select>

            <select
              value={targetType}
              onChange={(e) => {
                setTargetType(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All Target Types</option>
              <option value="Property">Property</option>
              <option value="User">User</option>
            </select>

            <button
              onClick={clearFilters}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:col-span-2"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Activity Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800">
              Activity History
            </h2>
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <Loader2
                size={32}
                className="animate-spin text-blue-600"
              />
            </div>
          ) : error ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
              <XCircle size={40} className="mb-3 text-red-400" />

              <p className="font-semibold text-gray-700">
                Unable to load activities
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {error}
              </p>

              <button
                onClick={fetchActivities}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
              <Activity size={42} className="mb-3 text-gray-300" />

              <h3 className="font-semibold text-gray-700">
                No activities found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Admin actions will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left text-sm">

                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-5 py-4">Admin</th>
                      <th className="px-5 py-4">Action</th>
                      <th className="px-5 py-4">Description</th>
                      <th className="px-5 py-4">Target</th>
                      <th className="px-5 py-4">Date & Time</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {activities.map((activity) => {
                      const actionDetails = getActionDetails(
                        activity.action
                      );

                      const ActionIcon = actionDetails.icon;

                      const target = getTargetDetails(activity);
                      const TargetIcon = target.icon;

                      return (
                        <tr
                          key={activity._id}
                          className="hover:bg-gray-50"
                        >

                          {/* Admin */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {activity.admin?.avatar ? (
                                <img
                                  src={activity.admin.avatar}
                                  alt={activity.admin.name}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                  <User size={18} />
                                </div>
                              )}

                              <div>
                                <p className="font-semibold text-gray-800">
                                  {activity.admin?.name || "Unknown Admin"}
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                  {activity.admin?.email || "N/A"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Action */}
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${actionDetails.color}`}
                            >
                              <ActionIcon size={14} />
                              {actionDetails.label}
                            </span>
                          </td>

                          {/* Description */}
                          <td className="max-w-sm px-5 py-4 text-gray-600">
                            {activity.description}
                          </td>

                          {/* Target */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <TargetIcon
                                size={16}
                                className="text-gray-400"
                              />

                              <div>
                                <p className="font-medium text-gray-700">
                                  {target.name}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                  {target.label} ID:{" "}
                                  {activity.targetId}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock
                                size={15}
                                className="text-gray-400"
                              />

                              <span className="text-xs">
                                {formatDate(activity.createdAt)}
                              </span>
                            </div>
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
                  {(page - 1) * 10 + 1} to{" "}
                  {(page - 1) * 10 + activities.length} of{" "}
                  {pagination.total} activities
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
                    Page {pagination.page || page} of{" "}
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

export default AdminActivityLog;
