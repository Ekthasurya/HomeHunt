
import User from "../models/User.js";
import Property from "../models/Property.js";
import Visit from "../models/Visit.js";
import Review from "../models/Review.js";

// GET ADMIN DASHBOARD
export const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProperties,
      totalVisits,
      reviewStats,
      userRoleStats,
      propertyApprovalStats,
      propertyStatusStats,
      propertyTypeStats,
      recentReviews,
      recentProperties,
      topRatedProperties,
    ] = await Promise.all([
      // Total active, non-deleted registered accounts
      User.countDocuments({ deletedAt: null }),

      // Total properties
      Property.countDocuments(),

      // Total property visits
      Visit.countDocuments(),

      // Platform-wide review statistics
      Review.aggregate([
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            averageRating: { $avg: "$rating" },
          },
        },
      ]),

      // User role analytics
      User.aggregate([
        {
          $match: { deletedAt: null },
        },
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
      ]),

      // Property approval analytics
      Property.aggregate([
        {
          $group: {
            _id: {
              $ifNull: ["$approvalStatus", "approved"],
            },
            count: { $sum: 1 },
          },
        },
      ]),

      // Property availability analytics
      Property.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      // Property type analytics
      Property.aggregate([
        {
          $group: {
            _id: "$propertyType",
            count: { $sum: 1 },
          },
        },
      ]),

      // Latest five customer reviews
      Review.find()
        .populate("buyer", "name avatar")
        .populate("property", "title price location images")
        .sort({ createdAt: -1 })
        .limit(5),

      // Latest five submitted properties
      Property.find()
        .populate("owner", "name email")
        .sort({ createdAt: -1 })
        .limit(5),

      // Five highest-rated properties
      Review.aggregate([
        {
          $group: {
            _id: "$property",
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
        {
          $sort: {
            averageRating: -1,
            totalReviews: -1,
          },
        },
        {
          $limit: 5,
        },
        {
          $lookup: {
            from: "properties",
            localField: "_id",
            foreignField: "_id",
            as: "property",
          },
        },
        {
          $unwind: "$property",
        },
        {
          $project: {
            _id: 1,
            averageRating: {
              $round: ["$averageRating", 1],
            },
            totalReviews: 1,
            title: "$property.title",
            price: "$property.price",
            location: "$property.location",
            images: "$property.images",
          },
        },
      ]),
    ]);

    const ratings = reviewStats[0] || {
      totalReviews: 0,
      averageRating: 0,
    };

    // Convert aggregation results into chart-friendly objects
    const userRoles = {
      buyer: 0,
      agent: 0,
      admin: 0,
    };

    userRoleStats.forEach((item) => {
      userRoles[item._id] = item.count;
    });

    const propertyApprovals = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    propertyApprovalStats.forEach((item) => {
      propertyApprovals[item._id] = item.count;
    });

    const propertyStatuses = {
      available: 0,
      sold: 0,
      rented: 0,
      pending: 0,
    };

    propertyStatusStats.forEach((item) => {
      if (item._id) {
        propertyStatuses[item._id] = item.count;
      }
    });

    const propertyTypes = propertyTypeStats.map((item) => ({
      name: item._id,
      count: item.count,
    }));

    return res.status(200).json({
      success: true,

      stats: {
        totalUsers,
        totalProperties,
        totalVisits,
        totalReviews: ratings.totalReviews,
        averageRating: Number(
          (ratings.averageRating || 0).toFixed(1)
        ),
      },

      analytics: {
        userRoles,
        propertyApprovals,
        propertyStatuses,
        propertyTypes,
      },

      recentReviews,
      recentProperties,
      topRatedProperties,
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch admin dashboard data",
    });
  }
};
