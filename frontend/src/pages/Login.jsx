
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight
} from "lucide-react";

import AuthLayout from "../layouts/AuthLayout";
import { login } from "../app/slices/authSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = formData.email.trim();

    if (!email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      await dispatch(
        login({
          email,
          password: formData.password
        })
      ).unwrap();

      navigate("/");
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : "Login failed. Please try again."
      );
    }
  };

  return (
    <AuthLayout>
      <div>
        <div className="mb-8">
          <span className="text-blue-600 font-semibold text-sm">
            WELCOME BACK
          </span>

          <h1 className="text-3xl font-bold text-slate-900 mt-3">
            Login to your account
          </h1>

          <p className="text-slate-500 mt-3">
            Enter your details to continue exploring HomeHunt.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address
            </label>

            <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 focus-within:border-blue-500">
              <Mail size={19} className="text-slate-400" />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full py-3.5 outline-none text-sm"
                autoComplete="email"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-700">
                Password
              </label>

              <button
                type="button"
                onClick={() =>
                  setError("Password recovery is not available yet.")
                }
                className="text-sm text-blue-600 font-semibold hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 focus-within:border-blue-500">
              <Lock size={19} className="text-slate-400" />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full py-3.5 outline-none text-sm"
                autoComplete="current-password"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                className="text-slate-400 hover:text-slate-700"
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>
          </div>

          {/* REMEMBER ME */}
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
              className="w-4 h-4 accent-blue-600"
            />
            Remember me
          </label>

          {/* ERROR */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
              {error}
            </p>
          )}

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition"
          >
            {loading ? "Logging in..." : "Login"}

            {!loading && <ArrowRight size={19} />}
          </button>

        </form>

        <div className="flex items-center gap-4 my-7">
          <div className="h-px bg-slate-200 flex-1" />

          <span className="text-xs text-slate-400">
            NEW TO HOMEHUNT?
          </span>

          <div className="h-px bg-slate-200 flex-1" />
        </div>

        <p className="text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-bold hover:underline"
          >
            Create Account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
