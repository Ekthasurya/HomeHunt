import { useState } from "react";
import { Link } from "react-router-dom";
import {
  UserRound,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  User,
  BriefcaseBusiness,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

import AuthLayout from "../layouts/AuthLayout";

export default function Register() {
  const [role, setRole] = useState("buyer");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
    setSuccess(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!formData.terms) {
      setError("Please accept the Terms and Conditions.");
      return;
    }

    // UI demonstration only. No account is created yet.
    setSuccess(true);
    setError("");
  };

  return (
    <AuthLayout>
      <div>
        <div className="mb-7">
          <span className="text-blue-600 font-semibold text-sm">
            GET STARTED
          </span>

          <h1 className="text-3xl font-bold text-slate-900 mt-3">
            Create your account
          </h1>

          <p className="text-slate-500 mt-3">
            Join HomeHunt and start your property journey.
          </p>
        </div>

        {/* ROLE SELECTION */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            I want to register as
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("buyer")}
              className={`flex items-center justify-center gap-2 p-4 rounded-xl border font-semibold transition ${
                role === "buyer"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <User size={20} />
              Buyer
            </button>

            <button
              type="button"
              onClick={() => setRole("agent")}
              className={`flex items-center justify-center gap-2 p-4 rounded-xl border font-semibold transition ${
                role === "agent"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <BriefcaseBusiness size={20} />
              Agent
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* FULL NAME */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Full Name
            </label>

            <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 focus-within:border-blue-500">
              <UserRound size={19} className="text-slate-400" />

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                className="w-full py-3 outline-none text-sm"
              />
            </div>
          </div>

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
                autoComplete="email"
                className="w-full py-3 outline-none text-sm"
              />
            </div>
          </div>

          {/* PHONE */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Mobile Number
            </label>

            <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 focus-within:border-blue-500">
              <Phone size={19} className="text-slate-400" />

              <span className="text-sm text-slate-500">+91</span>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                maxLength={10}
                autoComplete="tel-national"
                className="w-full py-3 outline-none text-sm"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Password
            </label>

            <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 focus-within:border-blue-500">
              <Lock size={19} className="text-slate-400" />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                className="w-full py-3 outline-none text-sm"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
                className="text-slate-400"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Confirm Password
            </label>

            <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 focus-within:border-blue-500">
              <Lock size={19} className="text-slate-400" />

              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                autoComplete="new-password"
                className="w-full py-3 outline-none text-sm"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label="Toggle confirm password visibility"
                className="text-slate-400"
              >
                {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          {/* TERMS */}
          <label className="flex items-start gap-3 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
              className="w-4 h-4 mt-0.5 accent-blue-600"
            />

            <span>
              I agree to the{" "}
              <span className="text-blue-600 font-semibold">
                Terms and Conditions
              </span>
              and Privacy Policy.
            </span>
          </label>

          {/* ERROR */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
              {error}
            </p>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="flex gap-3 items-start text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
              <CheckCircle size={20} className="shrink-0" />

              <p className="text-sm">
                Registration form validated successfully. Backend account
                creation will be connected later.
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition"
          >
            Create Account <ArrowRight size={19} />
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-7">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
