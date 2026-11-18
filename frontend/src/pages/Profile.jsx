
import { useState } from "react";
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

function Profile() {
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "Surya Kiran",
    email: "surya@example.com",
    phone: "9876543210",
    role: "Buyer",
    location: "Kolkata, West Bengal",
  });

  const [avatar, setAvatar] = useState(null);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setAvatar(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();

    setIsEditing(false);
    setMessage("Profile updated successfully (demo only).");

    setTimeout(() => setMessage(""), 3000);
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage("New password and confirmation do not match.");
      return;
    }

    if (passwords.newPassword.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    setMessage("Password update validated (demo only).");

    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

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
          <div className="mb-6 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
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
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      profile.name
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

              <h2 className="mt-4 text-xl font-bold text-gray-900">
                {profile.name}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {profile.email}
              </p>

              <span className="mt-4 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
                {profile.role}
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
                <span>{profile.role} Account</span>
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
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
                        disabled={!isEditing}
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
                        name="email"
                        value={profile.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        required
                        className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-3 outline-none focus:border-blue-500 disabled:bg-gray-50"
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
                        disabled={!isEditing}
                        required
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
                      name="location"
                      value={profile.location}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-blue-500 disabled:bg-gray-50"
                    />
                  </div>

                </div>

                {isEditing && (
                  <button
                    type="submit"
                    className="mt-6 flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                )}
              </form>
            </div>

            {/* Change Password */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Change Password
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update your password to keep your account secure.
                </p>
              </div>

              <form onSubmit={handlePasswordUpdate}>
                <div className="space-y-5">

                  {[
                    {
                      name: "currentPassword",
                      label: "Current Password",
                    },
                    {
                      name: "newPassword",
                      label: "New Password",
                    },
                    {
                      name: "confirmPassword",
                      label: "Confirm New Password",
                    },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        {field.label}
                      </label>

                      <div className="relative">
                        <Lock
                          size={18}
                          className="absolute left-3 top-3 text-gray-400"
                        />

                        <input
                          type="password"
                          name={field.name}
                          value={passwords[field.name]}
                          onChange={handlePasswordChange}
                          required
                          className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-3 outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  ))}

                </div>

                <button
                  type="submit"
                  className="mt-6 rounded-lg bg-gray-900 px-6 py-3 font-medium text-white hover:bg-gray-800"
                >
                  Update Password
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
