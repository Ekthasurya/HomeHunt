
import { Link, NavLink } from "react-router-dom";
import { Home, Menu, UserRound } from "lucide-react";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Properties", path: "/properties" },
  { name: "EMI Calculator", path: "/emi-calculator" },
];

export default function Navbar() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <Home size={22} />
          </div>

          <span className="text-2xl font-bold text-slate-900">
            Home<span className="text-blue-600">Hunt</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
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

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 font-medium text-slate-700 hover:text-blue-600"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Sign Up
          </Link>
        </div>

        <button className="md:hidden text-slate-700" aria-label="Open menu">
          <Menu size={25} />
        </button>

      </nav>
    </header>
  );
}
