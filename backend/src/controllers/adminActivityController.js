import AdminActivity from "../models/AdminActivity.js";

// GET ALL ADMIN ACTIVITIES
export const getAdminActivities = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

    const skip = (page - 1) * limit;

    const { action, targetType } = req.query;

    const filter = {};

    if (action) {
      filter.action = action;
    }

    if (targetType) {
      filter.targetType = targetType;
    }

    const [activities, total] = await Promise.all([
      AdminActivity.find(filter)
        .populate("admin", "name email avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      AdminActivity.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      activities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get Admin Activities Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch admin activities",
    });
  }
};