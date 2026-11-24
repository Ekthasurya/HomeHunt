import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Property from "../models/Property.js";
import Message from "../models/Message.js";

// @desc    Create or get existing conversation
// @route   POST /api/conversations
// @access  Private
export const createConversation = async (req, res) => {
  try {
    const { participantId, propertyId } = req.body;

    if (!participantId || !mongoose.Types.ObjectId.isValid(participantId)) {
      return res.status(400).json({
        success: false,
        message: "Valid participant ID is required"
      });
    }

    if (participantId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot start a conversation with yourself"
      });
    }

    const participant = await mongoose.model("User").findById(participantId);

    if (!participant || !participant.isActive) {
      return res.status(404).json({
        success: false,
        message: "Participant not found"
      });
    }

    if (
      !["buyer", "agent"].includes(req.user.role) ||
      !["buyer", "agent"].includes(participant.role) ||
      req.user.role === participant.role
    ) {
      return res.status(403).json({
        success: false,
        message: "Conversations are only allowed between buyers and agents"
      });
    }

    let property = null;

    if (propertyId) {
      if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid property ID"
        });
      }

      property = await Property.findById(propertyId);

      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Property not found"
        });
      }

      const agentId =
        req.user.role === "agent"
          ? req.user._id.toString()
          : participantId;

      if (property.owner.toString() !== agentId) {
        return res.status(400).json({
          success: false,
          message: "Property does not belong to this agent"
        });
      }
    }

    const participants = [
      req.user._id,
      participant._id
    ];

    let conversation = await Conversation.findOne({
      participants: { $all: participants, $size: 2 },
      property: property?._id || null
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants,
        property: property?._id || null
      });
    }

    const populatedConversation = await Conversation.findById(
      conversation._id
    )
      .populate("participants", "name email avatar role")
      .populate("property", "title price images");

    return res.status(200).json({
      success: true,
      message: "Conversation ready",
      conversation: populatedConversation
    });
  } catch (error) {
    console.error("Create Conversation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create conversation"
    });
  }
};


// @desc    Get logged-in user's conversations
// @route   GET /api/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate("participants", "name email avatar role")
      .populate("property", "title price images")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 });

    return res.status(200).json({
      success: true,
      totalConversations: conversations.length,
      conversations
    });
  } catch (error) {
    console.error("Get Conversations Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch conversations"
    });
  }
};


// @desc    Get conversation messages
// @route   GET /api/conversations/:id/messages
// @access  Private
export const getConversationMessages = async (req, res) => {
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

    const messages = await Message.find({
      conversation: id
    })
      .populate("sender", "name avatar role")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      totalMessages: messages.length,
      messages
    });
  } catch (error) {
    console.error("Get Conversation Messages Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch messages"
    });
  }
};