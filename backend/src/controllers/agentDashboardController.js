
import Property from "../models/Property.js";
import Visit from "../models/Visit.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Review from "../models/Review.js";

// GET AGENT DASHBOARD
export const getAgentDashboard = async (req, res) => {
  try {
    const agentId = req.user._id;
    const now = new Date();

    // Get all properties owned by this agent
    const agentPropertyIds = await Property.distinct("_id", {
      owner: agentId,
    });

    // Fetch dashboard data
    const [
      propertyStats,
      upcomingVisits,
      totalScheduledVisits,
      conversations,
      reviewStats,
      recentReviews,
      topViewedProperties,
    ] = await Promise.all([
      // Property statistics
      Property.aggregate([
        {
          $match: {
            owner: agentId,
          },
        },
        {
          $group: {
            _id: null,
            totalProperties: { $sum: 1 },
            totalViews: { $sum: "$views" },

            availableProperties: {
              $sum: {
                $cond: [{ $eq: ["$status", "available"] }, 1, 0],
              },
            },

            soldProperties: {
              $sum: {
                $cond: [{ $eq: ["$status", "sold"] }, 1, 0],
              },
            },

            rentedProperties: {
              $sum: {
                $cond: [{ $eq: ["$status", "rented"] }, 1, 0],
              },
            },
          },
        },
      ]),

      // Upcoming visits
      Visit.find({
        agent: agentId,
        status: { $in: ["pending", "confirmed"] },
        visitDate: { $gte: now },
      })
        .populate("property", "title images location")
        .populate("buyer", "name email phone")
        .sort({ visitDate: 1 })
        .limit(5),

      // Total upcoming scheduled visits
      Visit.countDocuments({
        agent: agentId,
        status: { $in: ["pending", "confirmed"] },
        visitDate: { $gte: now },
      }),

      // Recent conversations
      Conversation.find({
        participants: agentId,
      })
        .populate("participants", "name email avatar role")
        .populate("property", "title price images")
        .populate({
          path: "lastMessage",
          populate: {
            path: "sender",
            select: "name avatar role",
          },
        })
        .sort({ lastMessageAt: -1 })
        .limit(5),

      // Review statistics across agent properties
      Review.aggregate([
        {
          $match: {
            property: { $in: agentPropertyIds },
          },
        },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            averageRating: { $avg: "$rating" },
          },
        },
      ]),

      // Latest five reviews
      Review.find({
        property: { $in: agentPropertyIds },
      })
        .populate("buyer", "name avatar")
        .populate("property", "title images")
        .sort({ createdAt: -1 })
        .limit(5),

      // Top viewed properties
      Property.find({
        owner: agentId,
      })
        .select("title price images location views status listingType propertyType")
        .sort({ views: -1 })
        .limit(5),
    ]);

    // Property stats fallback
    const stats = propertyStats[0] || {
      totalProperties: 0,
      totalViews: 0,
      availableProperties: 0,
      soldProperties: 0,
      rentedProperties: 0,
    };

    // Review stats fallback
    const ratings = reviewStats[0] || {
      totalReviews: 0,
      averageRating: 0,
    };

    // Get all conversation IDs for this agent
    const conversationIds = await Conversation.distinct("_id", {
      participants: agentId,
    });

    // Count unread incoming messages
    const newInquiries = await Message.countDocuments({
      conversation: { $in: conversationIds },
      sender: { $ne: agentId },
      isRead: false,
    });

    // Format recent inquiries
    const recentInquiries = conversations.map((conversation) => {
      const buyer = conversation.participants.find(
        (participant) =>
          participant._id.toString() !== agentId.toString()
      );

      return {
        _id: conversation._id,
        buyer: buyer || null,
        property: conversation.property,
        lastMessage: conversation.lastMessage,
        lastMessageAt: conversation.lastMessageAt,
      };
    });

    // Return dashboard data
    return res.status(200).json({
      success: true,

      stats: {
        totalProperties: stats.totalProperties,
        totalViews: stats.totalViews,
        scheduledVisits: totalScheduledVisits,
        newInquiries,
        availableProperties: stats.availableProperties,
        soldProperties: stats.soldProperties,
        rentedProperties: stats.rentedProperties,

        // Review statistics
        averageRating: Number(ratings.averageRating.toFixed(1)),
        totalReviews: ratings.totalReviews,
      },

      // Property analytics
      topViewedProperties,

      upcomingVisits,
      recentInquiries,
      recentReviews,
    });
  } catch (error) {
    console.error("Agent Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch agent dashboard data",
    });
  }
};
