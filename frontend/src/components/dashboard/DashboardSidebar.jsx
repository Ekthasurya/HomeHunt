
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
} from "lucide-react";

const menuItems = [
  { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { label: "Properties", path: "/dashboard/properties", icon: Building2 },
  { label: "Users", path: "/dashboard/users", icon: Users, adminOnly: true },
  { label: "Visits", path: "/dashboard/visits", icon: CalendarDays },
  { label: "Messages", path: "/dashboard/messages", icon: MessageSquare },
  { label: "Settings", path: "/dashboard/settings", icon: Settings },
];

function DashboardSidebar({ role = "agent", open, onClose }) {
  return (
    <>
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
        <div className="flex h-20 items-center justify-between border-b border-gray-100 px-6">
          <NavLink to="/" className="text-2xl font-bold text-blue-600">
            HomeHunt
          </NavLink>

          <button onClick={onClose} className="lg:hidden">
            <X size={22} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {menuItems
            .filter((item) => !item.adminOnly || role === "admin")
            .map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/dashboard"}
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

        <div className="border-t border-gray-100 p-4">
          <NavLink
            to="/"
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
