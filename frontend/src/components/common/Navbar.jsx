
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  Home,
  Menu,
  X,
  UserRound,
  LogOut,
  LayoutDashboard,
  Bell,
  MessageSquare,
  Bookmark,
} from "lucide-react";

import { logout } from "../../app/slices/authSlice";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Properties", path: "/properties" },
  { name: "EMI Calculator", path: "/emi-calculator" },
];

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    initialized,
    loading,
  } = useSelector((state) => state.auth);

  const unreadCount = useSelector(
    (state) => state.notifications.unreadCount
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const dashboardPath =
    user?.role === "admin"
      ? "/admin/dashboard"
      : user?.role === "agent"
      ? "/dashboard"
      : null;

  const handleLogout = async () => {
    try {
      setLogoutError("");

      await dispatch(logout()).unwrap();

      setMenuOpen(false);
      navigate("/login");
    } catch (error) {
      setLogoutError(
        error || "Logout failed. Please try again."
      );
    }
  };

  const closeMenu = () => setMenuOpen(false);

  const NotificationBell = ({ mobile = false }) => (
    <Link
      to="/notifications"
      onClick={mobile ? closeMenu : undefined}
      className={`relative flex items-center gap-2 font-medium text-slate-700 hover:text-blue-600 ${
        mobile ? "w-fit" : "px-3 py-2"
      }`}
      aria-label={`Notifications, ${unreadCount} unread`}
    >
      <span className="relative">
        <Bell size={21} />

        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </span>

      {mobile && <span>Notifications</span>}
    </Link>
  );

  const AccountLinks = ({ mobile = false }) => (
    <>
      <Link
        to="/chat"
        onClick={mobile ? closeMenu : undefined}
        className="flex items-center gap-2 px-3 py-2 font-medium text-slate-700 hover:text-blue-600"
      >
        <MessageSquare size={19} />
        Messages
      </Link>

      {user?.role === "buyer" && (
        <Link
          to="/bookmarks"
          onClick={mobile ? closeMenu : undefined}
          className="flex items-center gap-2 px-3 py-2 font-medium text-slate-700 hover:text-blue-600"
        >
          <Bookmark size={19} />
          Bookmarks
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-2"
        >
          <div className="rounded-lg bg-blue-600 p-2 text-white">
            <Home size={22} />
          </div>

          <span className="text-2xl font-bold text-slate-900">
            Home<span className="text-blue-600">Hunt</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `font-medium transition ${
                  isActive
                    ? "text-blue-600"
                    : "text-slate-600 hover:text-blue-600"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Desktop Authentication */}
        <div className="hidden items-center gap-3 md:flex">
          {!initialized ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-100" />
          ) : isAuthenticated ? (
            <>
              <AccountLinks />

              <NotificationBell />

              {dashboardPath && (
                <Link
                  to={dashboardPath}
                  className="flex items-center gap-2 px-3 py-2 font-medium text-slate-700 hover:text-blue-600"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
              )}

              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-2 font-medium text-slate-700 hover:text-blue-600"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <UserRound size={20} />
                )}

                <span>{user?.name || "My Account"}</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
              >
                <LogOut size={18} />
                {loading ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 font-medium text-slate-700 hover:text-blue-600"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-slate-700 md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </nav>

      {/* Logout Error */}
      {logoutError && (
        <div className="mx-auto max-w-7xl px-5 pb-3 text-sm text-red-600">
          {logoutError}
        </div>
      )}

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="space-y-4 border-t border-slate-200 bg-white px-5 py-4 md:hidden">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={closeMenu}
              className={({ isActive }) =>
                `block font-medium ${
                  isActive
                    ? "text-blue-600"
                    : "text-slate-600 hover:text-blue-600"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          <div className="space-y-3 border-t border-slate-200 pt-4">
            {!initialized ? (
              <p className="text-sm text-slate-500">
                Loading account...
              </p>
            ) : isAuthenticated ? (
              <>
                <AccountLinks mobile />

                <NotificationBell mobile />

                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="flex items-center gap-2 font-medium text-slate-700"
                >
                  <UserRound size={19} />
                  {user?.name || "My Account"}
                </Link>

                {dashboardPath && (
                  <Link
                    to={dashboardPath}
                    onClick={closeMenu}
                    className="flex items-center gap-2 font-medium text-slate-700"
                  >
                    <LayoutDashboard size={19} />
                    Dashboard
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loading}
                  className="flex items-center gap-2 font-medium text-red-600 disabled:opacity-50"
                >
                  <LogOut size={19} />
                  {loading ? "Logging out..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="block font-medium text-slate-700"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="block rounded-lg bg-blue-600 px-5 py-2.5 text-center font-medium text-white"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
