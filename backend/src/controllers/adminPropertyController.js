
import mongoose from "mongoose";
import Property from "../models/Property.js";
import logAdminActivity from "../utils/logAdminActivity.js";

// @desc    Get all properties for admin
// @route   GET /api/admin/properties
// @access  Admin
export const getAllAdminProperties = async (req, res) => {
  try {
    const {
      search = "",
      propertyType = "",
      listingType = "",
      approvalStatus = "",
      status = "",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};
    const andConditions = [];

    // Search properties
    if (search.trim()) {
      const searchValue = search.trim();

      const searchRegex = new RegExp(
        searchValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      const searchConditions = [
        { title: searchRegex },
        { "location.city": searchRegex },
        { "location.state": searchRegex },
      ];

      // Search by owner ID
      if (mongoose.Types.ObjectId.isValid(searchValue)) {
        searchConditions.push({
          owner: new mongoose.Types.ObjectId(searchValue),
        });
      }

      andConditions.push({
        $or: searchConditions,
      });
    }

    // Property type filter
    if (
      ["apartment", "house", "villa", "plot", "commercial"].includes(
        propertyType
      )
    ) {
      filter.propertyType = propertyType;
    }

    // Listing type filter
    if (["sale", "rent"].includes(listingType)) {
      filter.listingType = listingType;
    }

    // Approval status filter
    if (approvalStatus === "approved") {
      // Include legacy properties without approvalStatus
      andConditions.push({
        $or: [
          { approvalStatus: "approved" },
          { approvalStatus: { $exists: false } },
        ],
      });
    } else if (["pending", "rejected"].includes(approvalStatus)) {
      filter.approvalStatus = approvalStatus;
    }

    // Availability status filter
    if (
      ["available", "sold", "rented", "pending"].includes(status)
    ) {
      filter.status = status;
    }

    // Combine search and approval conditions
    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    // Pagination
    const currentPage = Math.max(1, Number(page) || 1);

    const pageSize = Math.min(
      50,
      Math.max(1, Number(limit) || 10)
    );

    const [properties, totalProperties] = await Promise.all([
      Property.find(filter)
        .populate("owner", "name email phone avatar")
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize)
        .lean(),

      Property.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      properties,
      pagination: {
        totalProperties,
        currentPage,
        totalPages: Math.ceil(totalProperties / pageSize),
        pageSize,
      },
    });
  } catch (error) {
    console.error("Get Admin Properties Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch properties.",
    });
  }
};


// @desc    Approve or reject property
// @route   PATCH /api/admin/properties/:propertyId/approval
// @access  Admin
export const updatePropertyApproval = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { approvalStatus, rejectionReason = "" } = req.body;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID.",
      });
    }

    if (!["approved", "rejected"].includes(approvalStatus)) {
      return res.status(400).json({
        success: false,
        message: "Approval status must be approved or rejected.",
      });
    }

    if (
      typeof rejectionReason !== "string" ||
      (approvalStatus === "rejected" && !rejectionReason.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid rejection reason.",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found.",
      });
    }

    const previousApprovalStatus =
      property.approvalStatus || "approved";

    property.approvalStatus = approvalStatus;

    property.rejectionReason =
      approvalStatus === "rejected"
        ? rejectionReason.trim()
        : "";

    await property.save();

    // Log admin activity
    await logAdminActivity({
      admin: req.user._id,
      action:
        approvalStatus === "approved"
          ? "approve_property"
          : "reject_property",
      targetType: "Property",
      targetId: property._id,
      description: `Admin ${
        approvalStatus === "approved" ? "approved" : "rejected"
      } property ${property.title}`,
      metadata: {
        propertyTitle: property.title,
        previousApprovalStatus,
        newApprovalStatus: approvalStatus,
        rejectionReason: property.rejectionReason,
      },
    });

    res.status(200).json({
      success: true,
      message: `Property ${approvalStatus} successfully.`,
      property,
    });
  } catch (error) {
    console.error("Update Property Approval Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update property approval.",
    });
  }
};


// @desc    Verify or unverify property
// @route   PATCH /api/admin/properties/:propertyId/verification
// @access  Admin
export const updatePropertyVerification = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { isVerified } = req.body;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID.",
      });
    }

    if (typeof isVerified !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isVerified must be a boolean.",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found.",
      });
    }

    const previousIsVerified = property.isVerified;

    property.isVerified = isVerified;
    await property.save();

    // Log admin activity
    await logAdminActivity({
      admin: req.user._id,
      action: isVerified ? "verify_property" : "unverify_property",
      targetType: "Property",
      targetId: property._id,
      description: `Admin ${
        isVerified ? "verified" : "unverified"
      } property ${property.title}`,
      metadata: {
        propertyTitle: property.title,
        previousIsVerified,
        newIsVerified: isVerified,
      },
    });

    res.status(200).json({
      success: true,
      message: `Property ${
        isVerified ? "verified" : "unverified"
      } successfully.`,
      property,
    });
  } catch (error) {
    console.error("Update Property Verification Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update property verification.",
    });
  }
};


// @desc    Update property availability status
// @route   PATCH /api/admin/properties/:propertyId/status
// @access  Admin
export const updatePropertyStatus = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID.",
      });
    }

    if (
      !["available", "sold", "rented", "pending"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid property availability status.",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found.",
      });
    }

    const previousStatus = property.status;

    property.status = status;
    await property.save();

    // Log admin activity
    await logAdminActivity({
      admin: req.user._id,
      action: "update_property_status",
      targetType: "Property",
      targetId: property._id,
      description: `Admin changed property ${property.title} status from ${previousStatus} to ${status}`,
      metadata: {
        propertyTitle: property.title,
        previousStatus,
        newStatus: status,
      },
    });

    res.status(200).json({
      success: true,
      message: "Property status updated successfully.",
      property,
    });
  } catch (error) {
    console.error("Update Property Status Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update property status.",
    });
  }
};


// @desc    Feature or unfeature property
// @route   PATCH /api/admin/properties/:propertyId/featured
// @access  Admin
export const updatePropertyFeatured = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { isFeatured } = req.body;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID.",
      });
    }

    if (typeof isFeatured !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isFeatured must be a boolean.",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found.",
      });
    }

    const previousIsFeatured = property.isFeatured;

    property.isFeatured = isFeatured;
    await property.save();

    // Log admin activity
    await logAdminActivity({
      admin: req.user._id,
      action: isFeatured ? "feature_property" : "unfeature_property",
      targetType: "Property",
      targetId: property._id,
      description: `Admin ${
        isFeatured ? "featured" : "removed from featured"
      } property ${property.title}`,
      metadata: {
        propertyTitle: property.title,
        previousIsFeatured,
        newIsFeatured: isFeatured,
      },
    });

    res.status(200).json({
      success: true,
      message: `Property ${
        isFeatured ? "featured" : "removed from featured"
      } successfully.`,
      property,
    });
  } catch (error) {
    console.error("Update Property Featured Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update featured status.",
    });
  }
};
