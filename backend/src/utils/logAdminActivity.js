import AdminActivity from "../models/AdminActivity.js";

const logAdminActivity = async ({
  admin,
  action,
  targetType,
  targetId,
  description,
  metadata = {},
}) => {
  try {
    await AdminActivity.create({
      admin,
      action,
      targetType,
      targetId,
      description,
      metadata,
    });
  } catch (error) {
    // Logging failure should not interrupt the main admin action.
    console.error("Admin Activity Logging Error:", error);
  }
};

export default logAdminActivity;