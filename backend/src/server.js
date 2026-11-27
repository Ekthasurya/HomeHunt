
import "dotenv/config";

import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB from "./config/db.js";
import socketHandler from "./sockets/socketHandler.js";

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

socketHandler(io);
app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Start HTTP server first
httpServer.listen(PORT, "0.0.0.0", async () => {
  console.log(`HomeHunt server running on port ${PORT}`);
  console.log("Socket.io is ready");

  try {
    await connectDB();
    console.log("Database connection established");
  } catch (error) {
    console.error("MongoDB startup error:", error.message);
    process.exit(1);
  }
});
