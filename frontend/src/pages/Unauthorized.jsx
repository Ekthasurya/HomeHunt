
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function Unauthorized() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert size={40} />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          Access Denied
        </h1>

        <p className="text-slate-500 mb-7">
          You don't have permission to access this page.
          Please contact the administrator if you believe this is a mistake.
        </p>

        <Link
          to="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
