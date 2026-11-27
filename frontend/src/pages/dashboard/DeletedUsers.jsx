
import { useEffect, useState } from "react";
import {
  Search,
  RotateCcw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Users,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  getDeletedAdminUsers,
  restoreAdminUser,
} from "../../services/api/adminUserApi";

function DeletedUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    totalUsers: 0,
    currentPage: 1,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState(null);
  const [error, setError] = useState("");

  const fetchDeletedUsers = async (currentPage = page) => {
    try {
      setLoading(true);
      setError("");

      const response = await getDeletedAdminUsers({
        search,
        role,
        page: currentPage,
        limit: 10,
      });

      setUsers(response.users || []);
      setPagination(
        response.pagination || {
          totalUsers: 0,
          currentPage: 1,
          totalPages: 1,
        }
      );

      setPage(currentPage);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load deleted users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDeletedUsers(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search, role]);

  const handleRestore = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to restore ${user.name}'s account?`
    );

    if (!confirmed) return;

    try {
      setRestoringId(user._id);
      setError("");

      await restoreAdminUser(user._id);

      const nextPage =
        users.length === 1 && page > 1
          ? page - 1
          : page;

      await fetchDeletedUsers(nextPage);

      alert("User account restored successfully.");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to restore user account."
      );
    } finally {
      setRestoringId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Deleted Users
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and restore previously deleted user accounts.
          </p>
        </div>

        {/* Statistics */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-red-50 p-3">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Deleted Accounts
              </p>

              <h2 className="text-2xl font-bold text-gray-900">
                {pagination.totalUsers}
              </h2>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-green-600"
          >
            <option value="">All Roles</option>
            <option value="buyer">Buyer</option>
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Users Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900">
              Deleted Accounts List
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <Users className="mb-3 h-12 w-12 text-gray-300" />

              <h3 className="font-semibold text-gray-800">
                No deleted users found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Deleted accounts will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-5 py-4">User</th>
                      <th className="px-5 py-4">Role</th>
                      <th className="px-5 py-4">Phone</th>
                      <th className="px-5 py-4">Deleted Date</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-600">
                                {user.name?.charAt(0)?.toUpperCase()}
                              </div>
                            )}

                            <div>
                              <p className="font-medium text-gray-900">
                                {user.name}
                              </p>

                              <p className="text-xs text-gray-500">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 capitalize text-gray-600">
                          {user.role}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {user.phone || "N/A"}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {formatDate(user.deletedAt)}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                            Deleted
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleRestore(user)}
                            disabled={restoringId === user._id}
                            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {restoringId === user._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RotateCcw className="h-4 w-4" />
                            )}

                            Restore
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500">
                  Page {pagination.currentPage} of{" "}
                  {Math.max(1, pagination.totalPages)}
                  {" · "}
                  {pagination.totalUsers} users
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      fetchDeletedUsers(page - 1)
                    }
                    disabled={page <= 1}
                    className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() =>
                      fetchDeletedUsers(page + 1)
                    }
                    disabled={
                      page >= pagination.totalPages
                    }
                    className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
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

export default DeletedUsers;
