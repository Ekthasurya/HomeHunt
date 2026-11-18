
import { useMemo, useState } from "react";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Eye,
  Ban,
  CheckCircle,
  X,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";

const initialUsers = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    phone: "9876543210",
    role: "Buyer",
    status: "Active",
    joined: "12 Nov 2026",
  },
  {
    id: 2,
    name: "Priya Das",
    email: "priya@gmail.com",
    phone: "9876543211",
    role: "Agent",
    status: "Active",
    joined: "10 Nov 2026",
  },
  {
    id: 3,
    name: "Amit Roy",
    email: "amit@gmail.com",
    phone: "9876543212",
    role: "Buyer",
    status: "Inactive",
    joined: "08 Nov 2026",
  },
  {
    id: 4,
    name: "Sneha Gupta",
    email: "sneha@gmail.com",
    phone: "9876543213",
    role: "Agent",
    status: "Active",
    joined: "05 Nov 2026",
  },
  {
    id: 5,
    name: "Admin User",
    email: "admin@homehunt.com",
    phone: "9876543214",
    role: "Admin",
    status: "Active",
    joined: "01 Nov 2026",
  },
  {
    id: 6,
    name: "Arjun Singh",
    email: "arjun@gmail.com",
    phone: "9876543215",
    role: "Buyer",
    status: "Inactive",
    joined: "28 Oct 2026",
  },
];

function UsersManagement() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "All" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "All" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const stats = [
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Active Users",
      value: users.filter((user) => user.status === "Active").length,
      icon: UserCheck,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Inactive Users",
      value: users.filter((user) => user.status === "Inactive").length,
      icon: UserX,
      color: "bg-red-50 text-red-600",
    },
    {
      title: "Agents",
      value: users.filter((user) => user.role === "Agent").length,
      icon: ShieldCheck,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const toggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              status: user.status === "Active" ? "Inactive" : "Active",
            }
          : user
      )
    );

    setSelectedUser((prev) =>
      prev?.id === id
        ? {
            ...prev,
            status: prev.status === "Active" ? "Inactive" : "Active",
          }
        : prev
    );
  };

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

      {/* Statistics */}
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
                  <p className="text-sm text-gray-500">{stat.title}</p>
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
            <option value="Buyer">Buyer</option>
            <option value="Agent">Agent</option>
            <option value="Admin">Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Registered Users ({filteredUsers.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-5 py-4 font-medium">User</th>
                <th className="px-5 py-4 font-medium">Phone</th>
                <th className="px-5 py-4 font-medium">Role</th>
                <th className="px-5 py-4 font-medium">Joined</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.name
                          )}&background=eff6ff&color=2563eb`}
                          alt={user.name}
                          className="h-10 w-10 rounded-full"
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
                      {user.phone}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                        {user.role}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      {user.joined}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          user.status === "Active"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          title="View user"
                          className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          onClick={() => toggleStatus(user.id)}
                          title={
                            user.status === "Active"
                              ? "Deactivate user"
                              : "Activate user"
                          }
                          className={`rounded-lg p-2 ${
                            user.status === "Active"
                              ? "text-red-500 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                        >
                          {user.status === "Active" ? (
                            <Ban size={17} />
                          ) : (
                            <CheckCircle size={17} />
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
      </div>

      {/* User Details Modal */}
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
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  selectedUser.name
                )}&background=eff6ff&color=2563eb&size=120`}
                alt={selectedUser.name}
                className="h-24 w-24 rounded-full"
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
                  {selectedUser.phone}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Role</span>
                <span className="font-medium text-gray-900">
                  {selectedUser.role}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Joined</span>
                <span className="font-medium text-gray-900">
                  {selectedUser.joined}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Account Status</span>
                <span className="font-medium text-gray-900">
                  {selectedUser.status}
                </span>
              </div>
            </div>

            <button
              onClick={() => toggleStatus(selectedUser.id)}
              className="w-full rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
            >
              {selectedUser.status === "Active"
                ? "Deactivate Account"
                : "Activate Account"}
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default UsersManagement;
