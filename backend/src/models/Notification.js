import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    type: {
      type: String,
      enum: [
        "new_message",
        "visit_request",
        "visit_confirmed",
        "visit_rejected",
        "visit_cancelled",
        "system"
      ],
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },

    relatedModel: {
      type: String,
      enum: ["Property", "Visit", "Conversation"],
      default: null
    },

    isRead: {
      type: Boolean,
      default: false
    },

    readAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Efficient notification queries
notificationSchema.index({
  recipient: 1,
  isRead: 1,
  createdAt: -1
});

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

export default Notification;