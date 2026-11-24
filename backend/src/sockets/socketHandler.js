import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";

const socketHandler = (io) => {
  // Authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie || "";

const tokenFromCookie = cookieHeader
  .split(";")
  .map((cookie) => cookie.trim())
  .find((cookie) => cookie.startsWith("token="))
  ?.slice("token=".length);

const token =
  socket.handshake.auth?.token ||
  socket.handshake.headers?.authorization?.replace("Bearer ", "") ||
  (tokenFromCookie ? decodeURIComponent(tokenFromCookie) : null);

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select(
        "_id name email role isActive"
      );

      if (!user || !user.isActive) {
        return next(new Error("User not authorized"));
      }

      socket.user = user;

      next();
    } catch (error) {
      next(new Error("Invalid or expired authentication token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user._id}`);

    // Join personal notification room
    socket.join(`user:${socket.user._id}`);

    // Join a conversation room
    socket.on("join_conversation", async (conversationId, callback) => {
      try {
        if (
          typeof conversationId !== "string" ||
          !/^[a-f\d]{24}$/i.test(conversationId)
        ) {
          return callback?.({
            success: false,
            message: "Invalid conversation ID"
          });
        }

        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: socket.user._id
        });

        if (!conversation) {
          return callback?.({
            success: false,
            message: "Conversation not found"
          });
        }

        socket.join(`conversation:${conversationId}`);

        callback?.({
          success: true,
          message: "Joined conversation successfully"
        });
      } catch (error) {
        console.error("Join Conversation Error:", error);

        callback?.({
          success: false,
          message: "Unable to join conversation"
        });
      }
    });

    // Leave a conversation room
    socket.on("leave_conversation", (conversationId) => {
      if (
        typeof conversationId === "string" &&
        /^[a-f\d]{24}$/i.test(conversationId)
      ) {
        socket.leave(`conversation:${conversationId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user._id}`);
    });
  });
};

export default socketHandler;