
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// Set authentication cookie
const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

// Remove password from response
const getSafeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar,
  isActive: user.isActive
});

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      avatar
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters"
      });
    }

    const allowedRoles = ["buyer", "agent"];
    const userRole = role || "buyer";

    if (!allowedRoles.includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration role"
      });
    }

    const existingUser = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: existingUser.deletedAt
          ? "This email belongs to a deleted account. Please contact support."
          : "Email is already registered"
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: userRole,
      avatar: avatar || ""
    });

    const token = generateToken(user._id);

    setTokenCookie(res, token);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: getSafeUser(user)
    });
  } catch (error) {
    console.error("Registration Error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed"
    });
  }
};

// LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Block soft-deleted accounts
    if (user.deletedAt) {
      return res.status(403).json({
        success: false,
        message: "This account has been deleted. Please contact support."
      });
    }

    // Block inactive accounts
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive"
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const token = generateToken(user._id);

    setTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: getSafeUser(user)
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
};

// LOGOUT USER
export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });

  return res.status(200).json({
    success: true,
    message: "Logout successful"
  });
};

// GET CURRENT LOGGED-IN USER
export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: getSafeUser(req.user)
    });
  } catch (error) {
    console.error("Get Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch user profile"
    });
  }
};

// UPDATE USER PROFILE
export const updateMe = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Name must contain at least 2 characters"
        });
      }

      req.user.name = name.trim();
    }

    if (phone !== undefined) {
      if (typeof phone !== "string") {
        return res.status(400).json({
          success: false,
          message: "Phone must be a string"
        });
      }

      req.user.phone = phone.trim();
    }

    if (avatar !== undefined) {
      if (typeof avatar !== "string") {
        return res.status(400).json({
          success: false,
          message: "Avatar must be a valid URL string"
        });
      }

      req.user.avatar = avatar.trim();
    }

    await req.user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: getSafeUser(req.user)
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile"
    });
  }
};
