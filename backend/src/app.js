
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import bookmarkRoutes from "./routes/bookmarkRoutes.js";
import visitRoutes from "./routes/visitRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import agentDashboardRoutes from "./routes/agentDashboardRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import adminPropertyRoutes from "./routes/adminPropertyRoutes.js";
import adminActivityRoutes from "./routes/adminActivityRoutes.js";
import adminReportRoutes from "./routes/adminReportRoutes.js";

const app = express();

// Allowed frontend origins
const allowedOrigins = [
  "https://home-hunt-iota.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Request parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Basic API rate limiting
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  })
);

// Health check
app.use("/api/health", healthRoutes);

// Authentication routes
app.use("/api/auth", authRoutes);

// Property routes
app.use("/api/properties", propertyRoutes);

// Bookmark routes
app.use("/api/bookmarks", bookmarkRoutes);

// Visit routes
app.use("/api/visits", visitRoutes);

// Conversation routes
app.use("/api/conversations", conversationRoutes);

// Notification routes
app.use("/api/notifications", notificationRoutes);

// Agent dashboard routes
app.use("/api/agent-dashboard", agentDashboardRoutes);

// Reviews
app.use("/api/reviews", reviewRoutes);

// Admin dashboard routes
app.use("/api/admin-dashboard", adminDashboardRoutes);

// Admin user management routes
app.use("/api/admin/users", adminUserRoutes);

// Admin property management routes
app.use("/api/admin/properties", adminPropertyRoutes);

// Admin activity routes
app.use("/api/admin/activities", adminActivityRoutes);

// Admin reports
app.use("/api/admin/reports", adminReportRoutes);

// Welcome route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to HomeHunt API",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("API Error:", err.message);

  if (err.message.startsWith("CORS blocked")) {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed by CORS",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

export default app;
