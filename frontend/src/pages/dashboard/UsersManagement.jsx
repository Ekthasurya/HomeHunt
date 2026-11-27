
import { useEffect, useState } from "react";

import {
  Search,
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Eye,
  Ban,
  CheckCircle,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  getAdminUsers,
  updateAdminUserStatus,
  deleteAdminUser,
} from "../../services/api/adminUserApi";

import { useSelector } from "react-redux";

function UsersManagement() {
  const { user: currentUser } = useSelector((state) => state.auth);

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedUser, setSelectedUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    pageSize: 10,
  });

  // FETCH USERS
  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: 10,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (roleFilter !== "All") {
        params.role = roleFilter.toLowerCase();
      }

      if (statusFilter !== "All") {
        params.status = statusFilter.toLowerCase();
      }

      const response = await getAdminUsers(params);

      setUsers(response.users || []);

      setPagination(
        response.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalUsers: 0,
          pageSize: 10,
        }
      );
    } catch (err) {
      console.error("FETCH USERS ERROR:", err);

      setError(
        err.response?.data?.message || "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  // FETCH WHEN FILTERS CHANGE
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search, roleFilter, statusFilter]);

  // UPDATE USER STATUS
  const toggleStatus = async (user) => {
    if (user._id === currentUser?._id) {
      alert("You cannot change your own admin account status.");
      return;
    }

    if (user.role === "admin") {
      alert("Admin accounts cannot be modified.");
      return;
    }

    const nextStatus = !user.isActive;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        nextStatus ? "activate" : "deactivate"
      } ${user.name}?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(user._id);
      setError("");

      await updateAdminUserStatus(user._id, nextStatus);

      setUsers((prev) =>
        prev.map((item) =>
          item._id === user._id
            ? { ...item, isActive: nextStatus }
            : item
        )
      );

      setSelectedUser((prev) =>
        prev?._id === user._id
          ? { ...prev, isActive: nextStatus }
          : prev
      );
    } catch (err) {
      console.error("UPDATE USER STATUS ERROR:", err);

      alert(
        err.response?.data?.message ||
          "Failed to update user status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // SOFT DELETE USER
  const handleDeleteUser = async (user) => {
    if (user._id === currentUser?._id) {
      alert("You cannot delete your own admin account.");
      return;
    }

    if (user.role === "admin") {
      alert("Admin accounts cannot be deleted.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?\n\n` +
      "This account will be deactivated and hidden from the user list.\n\n" +
      "Their properties, reviews, visits and chat history will be preserved."
    );

    if (!confirmed) return;

    try {
      setDeletingId(user._id);
      setError("");

      await deleteAdminUser(user._id);

      // Close modal if the deleted user was selected
      setSelectedUser((prev) =>
        prev?._id === user._id ? null : prev
      );

      // If this was the only user on the current page,
      // move to the previous page.
      const nextPage =
        users.length === 1 && pagination.currentPage > 1
          ? pagination.currentPage - 1
          : pagination.currentPage;

      await fetchUsers(nextPage);

      alert("User account deleted successfully.");
    } catch (err) {
      console.error("DELETE USER ERROR:", err);

      alert(
        err.response?.data?.message ||
          "Failed to delete user account."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // STATISTICS
  const stats = [
    {
      title: "Total Users",
      value: pagination.totalUsers,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Active Users",
      value: users.filter((user) => user.isActive).length,
      icon: UserCheck,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Inactive Users",
      value: users.filter((user) => !user.isActive).length,
      icon: UserX,
      color: "bg-red-50 text-red-600",
    },
    {
      title: "Agents",
      value: users.filter((user) => user.role === "agent").length,
      icon: ShieldCheck,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusLabel = (isActive) =>
    isActive ? "Active" : "Inactive";

  return (
    <DashboardLayout role="admin">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          User Management
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage HomeHunt buyers, agents and administrators.
        </p>
      </div>

      {/* STATISTICS */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {stat.title}
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-gray-900">
                    {stat.value}
                  </h2>
                </div>

                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon size={23} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FILTERS */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-3 outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="All">All Roles</option>
            <option value="buyer">Buyer</option>
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* USERS TABLE */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Registered Users ({pagination.totalUsers})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-5 py-4 font-medium">User</th>
                <th className="px-5 py-4 font-medium">Phone</th>
                <th className="px-5 py-4 font-medium">Role</th>
                <th className="px-5 py-4 font-medium">Joined</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 text-right font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center">
                    <Loader2 className="mx-auto animate-spin text-blue-600" />
                    <p className="mt-2 text-gray-500">
                      Loading users...
                    </p>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            user.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              user.name
                            )}&background=eff6ff&color=2563eb`
                          }
                          alt={user.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />

                        <div>
                          <p className="font-semibold text-gray-900">
                            {user.name}
                          </p>

                          <p className="text-xs text-gray-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {user.phone || "N/A"}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium capitalize text-purple-700">
                        {user.role}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          user.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {getStatusLabel(user.isActive)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {/* VIEW */}
                        <button
                          onClick={() => setSelectedUser(user)}
                          title="View user"
                          className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye size={17} />
                        </button>

                        {/* ACTIVATE / DEACTIVATE */}
                        <button
                          onClick={() => toggleStatus(user)}
                          disabled={
                            updatingId === user._id ||
                            deletingId === user._id ||
                            user._id === currentUser?._id ||
                            user.role === "admin"
                          }
                          title={
                            user.role === "admin"
                              ? "Admin account"
                              : user.isActive
                              ? "Deactivate user"
                              : "Activate user"
                          }
                          className={`rounded-lg p-2 disabled:cursor-not-allowed disabled:opacity-40 ${
                            user.isActive
                              ? "text-red-500 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                        >
                          {updatingId === user._id ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : user.isActive ? (
                            <Ban size={17} />
                          ) : (
                            <CheckCircle size={17} />
                          )}
                        </button>

                        {/* DELETE */}
                        <button
                          onClick={() => handleDeleteUser(user)}
                          disabled={
                            deletingId === user._id ||
                            updatingId === user._id ||
                            user._id === currentUser?._id ||
                            user.role === "admin"
                          }
                          title="Delete user account"
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {deletingId === user._id ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={17} />
                          )}
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
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
            <p className="text-sm text-gray-500">
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  fetchUsers(pagination.currentPage - 1)
                }
                disabled={pagination.currentPage <= 1}
                className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={() =>
                  fetchUsers(pagination.currentPage + 1)
                }
                disabled={
                  pagination.currentPage >= pagination.totalPages
                }
                className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* USER DETAILS MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                User Details
              </h2>

              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col items-center">
              <img
                src={
                  selectedUser.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    selectedUser.name
                  )}&background=eff6ff&color=2563eb&size=120`
                }
                alt={selectedUser.name}
                className="h-24 w-24 rounded-full object-cover"
              />

              <h3 className="mt-4 text-lg font-bold text-gray-900">
                {selectedUser.name}
              </h3>

              <p className="text-sm text-gray-500">
                {selectedUser.email}
              </p>
            </div>

            <div className="my-6 space-y-4 border-t border-gray-100 pt-5 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Phone</span>
                <span className="font-medium text-gray-900">
                  {selectedUser.phone || "N/A"}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Role</span>
                <span className="font-medium capitalize text-gray-900">
                  {selectedUser.role}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Joined</span>
                <span className="font-medium text-gray-900">
                  {formatDate(selectedUser.createdAt)}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Account Status</span>
                <span className="font-medium text-gray-900">
                  {getStatusLabel(selectedUser.isActive)}
                </span>
              </div>
            </div>

            {/* STATUS BUTTON */}
            <button
              onClick={() => toggleStatus(selectedUser)}
              disabled={
                updatingId === selectedUser._id ||
                deletingId === selectedUser._id ||
                selectedUser._id === currentUser?._id ||
                selectedUser.role === "admin"
              }
              className="mb-3 w-full rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updatingId === selectedUser._id ? (
                "Updating..."
              ) : selectedUser.isActive ? (
                "Deactivate Account"
              ) : (
                "Activate Account"
              )}
            </button>

            {/* DELETE BUTTON */}
            <button
              onClick={() => handleDeleteUser(selectedUser)}
              disabled={
                deletingId === selectedUser._id ||
                updatingId === selectedUser._id ||
                selectedUser._id === currentUser?._id ||
                selectedUser.role === "admin"
              }
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-5 py-3 font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deletingId === selectedUser._id ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  Delete Account
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default UsersManagement;
