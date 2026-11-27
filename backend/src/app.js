
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

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
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

app.use("/api/reviews", reviewRoutes);
// Admin dashboard routes
app.use("/api/admin-dashboard", adminDashboardRoutes);
// Admin user management routes
app.use("/api/admin/users", adminUserRoutes);

app.use("/api/admin/properties", adminPropertyRoutes);
app.use("/api/admin/activities", adminActivityRoutes);
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

export default app;
