
import User from "../models/User.js";
import mongoose from "mongoose";
import logAdminActivity from "../utils/logAdminActivity.js";

// GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const {
      search = "",
      role = "",
      status = "",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {
      deletedAt: null,
    };

    if (search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (["buyer", "agent", "admin"].includes(role)) {
      filter.role = role;
    }

    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, Number(limit) || 10)
    );

    const skip = (currentPage - 1) * pageSize;

    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),

      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        totalUsers,
        currentPage,
        totalPages: Math.ceil(totalUsers / pageSize),
        pageSize,
      },
    });
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};


// UPDATE USER STATUS
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean",
      });
    }

    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own account status",
      });
    }

    const user = await User.findOne({
      _id: userId,
      deletedAt: null,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be modified",
      });
    }

    const previousIsActive = user.isActive;

    user.isActive = isActive;
    await user.save();

    // Log admin activity only when the status changes
    if (previousIsActive !== isActive) {
      await logAdminActivity({
        admin: req.user._id,
        action: isActive ? "activate_user" : "deactivate_user",
        targetType: "User",
        targetId: user._id,
        description: `Admin ${
          isActive ? "activated" : "deactivated"
        } user ${user.name}`,
        metadata: {
          userName: user.name,
          userEmail: user.email,
          userRole: user.role,
          previousIsActive,
          newIsActive: isActive,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${
        isActive ? "activated" : "deactivated"
      } successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        deletedAt: user.deletedAt,
      },
    });
  } catch (error) {
    console.error("Update user status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update user status",
    });
  }
};


// SOFT DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Prevent admin from deleting their own account
    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findOne({
      _id: userId,
      deletedAt: null,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or already deleted",
      });
    }

    // Protect admin accounts
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be deleted",
      });
    }

    // Soft delete
    user.isActive = false;
    user.deletedAt = new Date();

    await user.save();

    // Log admin activity
    await logAdminActivity({
      admin: req.user._id,
      action: "delete_user",
      targetType: "User",
      targetId: user._id,
      description: `Admin deleted user ${user.name}`,
      metadata: {
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        previousIsActive: true,
        newIsActive: false,
        deletedAt: user.deletedAt,
      },
    });

    res.status(200).json({
      success: true,
      message: "User account deleted successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        deletedAt: user.deletedAt,
      },
    });
  } catch (error) {
    console.error("Soft delete user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};


// GET ALL DELETED USERS
export const getDeletedUsers = async (req, res) => {
  try {
    const {
      search = "",
      role = "",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {
      deletedAt: { $ne: null },
    };

    if (search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (["buyer", "agent", "admin"].includes(role)) {
      filter.role = role;
    }

    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(limit) || 10));

    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ deletedAt: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize)
        .lean(),

      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        totalUsers,
        currentPage,
        totalPages: Math.ceil(totalUsers / pageSize),
        pageSize,
      },
    });
  } catch (error) {
    console.error("Get deleted users error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch deleted users.",
    });
  }
};


// RESTORE DELETED USER
export const restoreUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const user = await User.findOne({
      _id: userId,
      deletedAt: { $ne: null },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Deleted user not found.",
      });
    }

    const previousIsActive = user.isActive;
    const previousDeletedAt = user.deletedAt;

    user.deletedAt = null;
    user.isActive = true;

    await user.save();

    // Log admin activity
    await logAdminActivity({
      admin: req.user._id,
      action: "restore_user",
      targetType: "User",
      targetId: user._id,
      description: `Admin restored user ${user.name}`,
      metadata: {
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        previousIsActive,
        newIsActive: true,
        previousDeletedAt,
      },
    });

    res.status(200).json({
      success: true,
      message: "User account restored successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive,
        deletedAt: user.deletedAt,
      },
    });
  } catch (error) {
    console.error("Restore user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to restore user account.",
    });
  }
};
