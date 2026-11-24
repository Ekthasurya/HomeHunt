import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";

// @desc    Send a message
// @route   POST /api/conversations/:id/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID"
      });
    }

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message text is required"
      });
    }

    if (text.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 2000 characters"
      });
    }

    const conversation = await Conversation.findOne({
      _id: id,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found"
      });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text: text.trim()
    });

    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();

    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name avatar role");
    const io = req.app.get("io");

if (io) {
  io.to(`conversation:${conversation._id}`).emit(
    "new_message",
    populatedMessage
  );
}

    const recipient = conversation.participants.find(
      (participantId) =>
        participantId.toString() !== req.user._id.toString()
    );

   if (recipient) {
  const notification = await Notification.create({
    recipient,
    sender: req.user._id,
    type: "new_message",
    title: "New Message",
    message: `${req.user.name} sent you a message.`,
    relatedId: conversation._id,
    relatedModel: "Conversation"
  });

  const io = req.app.get("io");

  // Send real-time notification to recipient
  if (io) {
    io.to(`user:${recipient}`).emit(
      "new_notification",
      notification
    );
  }
}
    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage
    });
  } catch (error) {
    console.error("Send Message Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send message"
    });
  }
};


// @desc    Mark conversation messages as read
// @route   PATCH /api/conversations/:id/read
// @access  Private
export const markMessagesAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID"
      });
    }

    const conversation = await Conversation.findOne({
      _id: id,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found"
      });
    }

    const result = await Message.updateMany(
      {
        conversation: id,
        sender: { $ne: req.user._id },
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: "Messages marked as read",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Mark Messages Read Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to mark messages as read"
    });
  }
};