import mongoose from "mongoose";

const adminActivitySchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      required: true,
      enum: [
        "approve_property",
        "reject_property",
        "verify_property",
        "unverify_property",
        "feature_property",
        "unfeature_property",
        "update_property_status",
        "deactivate_user",
        "restore_user",
        "delete_user",
      ],
    },

    targetType: {
      type: String,
      required: true,
      enum: ["Property", "User"],
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for retrieving recent activities efficiently
adminActivitySchema.index({ createdAt: -1 });

// Index for filtering activities by admin
adminActivitySchema.index({ admin: 1, createdAt: -1 });

const AdminActivity = mongoose.model(
  "AdminActivity",
  adminActivitySchema
);

export default AdminActivity;