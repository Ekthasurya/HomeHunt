
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  User,
  Mail,
  Phone,
  Camera,
  Lock,
  Save,
  Pencil,
  ShieldCheck,
} from "lucide-react";

import { updateProfile } from "../app/slices/authSlice";

function Profile() {
  const dispatch = useDispatch();

  const { user, loading } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    role: "buyer",
  });

  // Load logged-in user details
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "buyer",
      });
    }
  }, [user]);

  // Clean up temporary avatar preview URL
  useEffect(() => {
    return () => {
      if (avatar?.startsWith("blob:")) {
        URL.revokeObjectURL(avatar);
      }
    };
  }, [avatar]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Avatar preview only
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessageType("error");
      setMessage("Please select a valid image.");
      return;
    }

    setAvatar(URL.createObjectURL(file));
    setMessage("");
  };

  // Save profile to MongoDB
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!profile.name.trim()) {
      setMessageType("error");
      setMessage("Name is required.");
      return;
    }

    try {
      await dispatch(
        updateProfile({
          name: profile.name.trim(),
          phone: profile.phone.trim(),
        })
      ).unwrap();

      setIsEditing(false);
      setMessageType("success");
      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessageType("error");

      setMessage(
        typeof error === "string"
          ? error
          : error?.message || "Unable to update profile."
      );
    }
  };

  // Cancel editing and restore original data
  const handleCancel = () => {
    setIsEditing(false);
    setAvatar(null);

    setProfile({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      role: user?.role || "buyer",
    });

    setMessage("");
  };

  const formattedRole =
    profile.role.charAt(0).toUpperCase() + profile.role.slice(1);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">
            Account Settings
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            My Profile
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your personal information and account settings.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 rounded-lg px-4 py-3 text-sm ${
              messageType === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* Profile Sidebar */}
          <div className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">

              <div className="relative">
                <img
                  src={
                    avatar ||
                    user?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      profile.name || "User"
                    )}&background=2563eb&color=fff&size=160`
                  }
                  alt="Profile"
                  className="h-28 w-28 rounded-full border-4 border-blue-50 object-cover"
                />

                <label className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700">
                  <Camera size={17} />

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              <p className="mt-2 text-xs text-gray-400">
                Preview only — upload support coming later.
              </p>

              <h2 className="mt-4 text-xl font-bold text-gray-900">
                {profile.name}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {profile.email}
              </p>

              <span className="mt-4 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
                {formattedRole}
              </span>
            </div>

            <div className="my-6 border-t border-gray-100" />

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3 text-gray-600">
                <ShieldCheck size={18} className="text-blue-600" />
                <span>Account protected</span>
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <User size={18} className="text-blue-600" />
                <span>{formattedRole} Account</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">

            {/* Personal Information */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Personal Information
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Update your personal details.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    if (isEditing) {
                      handleCancel();
                    } else {
                      setIsEditing(true);
                      setMessage("");
                    }
                  }}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  <Pencil size={15} />
                  {isEditing ? "Cancel" : "Edit"}
                </button>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  {/* Name */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Full Name
                    </label>

                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-3 top-3 text-gray-400"
                      />

                      <input
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                        disabled={!isEditing || loading}
                        required
                        className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-3 outline-none focus:border-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Email Address
                    </label>

                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-3 top-3 text-gray-400"
                      />

                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-3 text-gray-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>

                    <div className="relative">
                      <Phone
                        size={18}
                        className="absolute left-3 top-3 text-gray-400"
                      />

                      <input
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        disabled={!isEditing || loading}
                        className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-3 outline-none focus:border-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Location
                    </label>

                    <input
                      type="text"
                      value="Not available yet"
                      disabled
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-gray-400 outline-none"
                    />

                    <p className="mt-1 text-xs text-gray-400">
                      Location updates will be available in a future update.
                    </p>
                  </div>
                </div>

                {/* Save Button */}
                {isEditing && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={18} />
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                )}
              </form>
            </div>

            {/* Change Password */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Change Password
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Password management for your account.
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-start gap-3">
                  <Lock size={20} className="mt-0.5 text-gray-500" />

                  <div>
                    <p className="font-medium text-gray-800">
                      Password update is not available yet.
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      This feature will be enabled after the backend
                      password update API is implemented.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
