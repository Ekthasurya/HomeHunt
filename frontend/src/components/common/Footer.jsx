
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 mt-16">
      <div className="max-w-7xl mx-auto px-5 py-12">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          <div>
            <h2 className="text-2xl font-bold text-white">
              Home<span className="text-blue-500">Hunt</span>
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-400">
              Discover your perfect property with HomeHunt.
              Find homes, explore locations and connect with
              trusted real-estate agents.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">
              Quick Links
            </h3>

            <div className="flex flex-col gap-3 text-sm">
              <Link to="/">Home</Link>
              <Link to="/properties">Properties</Link>
              <Link to="/emi-calculator">EMI Calculator</Link>
              <Link to="/login">Login</Link>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">
              Contact
            </h3>

            <p className="text-sm text-slate-400">
              Have questions about a property?
              Connect with our team.
            </p>
          </div>

        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} HomeHunt. All rights reserved.
        </div>

      </div>
    </footer>
  );
}
