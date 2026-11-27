
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect routes (authentication required)
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization?.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      _id: decoded.id,
      isActive: true,
      deletedAt: null,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Account inactive or deleted. Please log in again.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid or expired token.",
    });
  }
};


// Optional authentication (public routes)
export const optionalProtect = async (req, res, next) => {
  try {
    let token;

    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization?.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // No token: continue as a guest
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      _id: decoded.id,
      isActive: true,
      deletedAt: null,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Account inactive or deleted. Please log in again.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid or expired token.",
    });
  }
};


// Restrict routes by role
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};
