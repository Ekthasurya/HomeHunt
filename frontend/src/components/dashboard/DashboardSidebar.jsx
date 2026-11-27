
import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Building2,
  Users,
  CalendarDays,
  MessageSquare,
  Settings,
  Home,
  X,
  Trash2,
  Activity,
  FileSpreadsheet,
} from "lucide-react";

const menuItems = [
  {
    label: "Overview",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: ["agent"],
  },
  {
    label: "Properties",
    path: "/dashboard/properties",
    icon: Building2,
    roles: ["agent"],
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    label: "Deleted Users",
    path: "/admin/deleted-users",
    icon: Trash2,
    roles: ["admin"],
  },
  {
    label: "Visits",
    path: "/dashboard/visits",
    icon: CalendarDays,
    roles: ["agent"],
  },
  {
    label: "Messages",
    path: "/chat",
    icon: MessageSquare,
    roles: ["agent"],
  },
  {
    label: "Settings",
    path: "/dashboard/settings",
    icon: Settings,
    roles: ["agent", "admin"],
  },
  {
    label: "Properties",
    path: "/admin/properties",
    icon: Building2,
    roles: ["admin"],
  },
  {
    label: "Activity Log",
    path: "/admin/activities",
    icon: Activity,
    roles: ["admin"],
  },
  {
    label: "Reports",
    path: "/admin/reports",
    icon: FileSpreadsheet,
    roles: ["admin"],
  },
];

function DashboardSidebar({ role = "agent", open, onClose }) {
  const dashboardPath =
    role === "admin" ? "/admin/dashboard" : "/dashboard";

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-gray-100 px-6">
          <NavLink to="/" className="text-2xl font-bold text-blue-600">
            HomeHunt
          </NavLink>

          <button
            type="button"
            onClick={onClose}
            className="lg:hidden"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {/* Dashboard Overview */}
          <NavLink
            to={dashboardPath}
            end
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            <LayoutDashboard size={19} />
            Overview
          </NavLink>

          {/* Role-Based Menu Items */}
          {filteredMenuItems
            .filter((item) => item.label !== "Overview")
            .map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`
                  }
                >
                  <Icon size={19} />
                  {item.label}
                </NavLink>
              );
            })}
        </nav>

        {/* Back to Website */}
        <div className="border-t border-gray-100 p-4">
          <NavLink
            to="/"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-600 hover:bg-gray-100"
          >
            <Home size={19} />
            Back to Website
          </NavLink>
        </div>
      </aside>
    </>
  );
}

export default DashboardSidebar;
