import mongoose from "mongoose";
import Visit from "../models/Visit.js";
import Property from "../models/Property.js";
import Notification from "../models/Notification.js";

const sendVisitNotification = async ({
  req,
  recipient,
  type,
  title,
  message,
  visitId,
}) => {
  const notification = await Notification.create({
    recipient,
    sender: req.user._id,
    type,
    title,
    message,
    relatedId: visitId,
    relatedModel: "Visit",
  });

  const io = req.app.get("io");

  if (io) {
    io.to(`user:${recipient}`).emit("new_notification", notification);
  }

  return notification;
};

// @desc    Schedule a property visit
// @route   POST /api/visits
// @access  Private (Buyer)
export const createVisit = async (req, res) => {
  try {
    const { propertyId, visitDate, visitTime, message } = req.body;

    if (!propertyId || !visitDate || !visitTime) {
      return res.status(400).json({
        success: false,
        message: "Property, visit date and visit time are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    if (req.user.role !== "buyer") {
      return res.status(403).json({
        success: false,
        message: "Only buyers can schedule visits",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property || property.status !== "available") {
      return res.status(404).json({
        success: false,
        message: "Available property not found",
      });
    }

    if (property.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot schedule a visit to your own property",
      });
    }

    const parsedDate = new Date(visitDate);

    if (Number.isNaN(parsedDate.getTime()) || parsedDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Visit date must be in the future",
      });
    }

    if (!/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i.test(visitTime)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid time, such as 10:30 AM",
      });
    }

    if (message && typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message must be text",
      });
    }

    const visit = await Visit.create({
      property: property._id,
      buyer: req.user._id,
      agent: property.owner,
      visitDate: parsedDate,
      visitTime,
      message: message || "",
    });

    const populatedVisit = await Visit.findById(visit._id)
      .populate("property", "title price images location")
      .populate("buyer", "name email phone")
      .populate("agent", "name email phone");

    await sendVisitNotification({
      req,
      recipient: property.owner,
      type: "visit_request",
      title: "New Visit Request",
      message: `${req.user.name} requested a visit for ${property.title}.`,
      visitId: visit._id,
    });

    return res.status(201).json({
      success: true,
      message: "Property visit scheduled successfully",
      visit: populatedVisit,
    });
  } catch (error) {
    console.error("Create Visit Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to schedule property visit",
    });
  }
};

// @desc    Get logged-in user's visits
// @route   GET /api/visits/my-visits
// @access  Private
export const getMyVisits = async (req, res) => {
  try {
    const filter =
      req.user.role === "agent"
        ? { agent: req.user._id }
        : { buyer: req.user._id };

    const visits = await Visit.find(filter)
      .populate("property", "title price images location")
      .populate("buyer", "name email phone")
      .populate("agent", "name email phone")
      .sort({ visitDate: 1 });

    return res.status(200).json({
      success: true,
      totalVisits: visits.length,
      visits,
    });
  } catch (error) {
    console.error("Get Visits Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch visits",
    });
  }
};

// @desc    Update visit status
// @route   PATCH /api/visits/:id/status
// @access  Private (Agent/Admin)
export const updateVisitStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, agentNote } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid visit ID",
      });
    }

    const allowedStatuses = ["confirmed", "rejected", "completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid visit status",
      });
    }

    if (req.user.role !== "agent" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only agents or admins can update visit status",
      });
    }

    const visit = await Visit.findById(id);

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: "Visit not found",
      });
    }

    if (
      req.user.role === "agent" &&
      visit.agent.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot manage this visit",
      });
    }

    if (visit.status === "cancelled" || visit.status === "rejected") {
      return res.status(400).json({
        success: false,
        message: "This visit can no longer be updated",
      });
    }

    if (status === "completed" && visit.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Only confirmed visits can be completed",
      });
    }

    if (agentNote !== undefined && typeof agentNote !== "string") {
      return res.status(400).json({
        success: false,
        message: "Agent note must be text",
      });
    }

    if (agentNote !== undefined) {
      visit.agentNote = agentNote.trim();
    }

    visit.status = status;
    await visit.save();

    await sendVisitNotification({
      req,
      recipient: visit.agent,
      type: "visit_cancelled",
      title: "Visit Cancelled",
      message: `${req.user.name} cancelled a property visit.`,
      visitId: visit._id,
    });

    const updatedVisit = await Visit.findById(visit._id)
      .populate("property", "title price images location")
      .populate("buyer", "name email phone")
      .populate("agent", "name email phone");

    if (status === "confirmed" || status === "rejected") {
      await sendVisitNotification({
        req,
        recipient: visit.buyer,
        type: status === "confirmed" ? "visit_confirmed" : "visit_rejected",
        title: status === "confirmed" ? "Visit Confirmed" : "Visit Rejected",
        message: `Your property visit has been ${status}.`,
        visitId: visit._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Visit status updated successfully",
      visit: updatedVisit,
    });
  } catch (error) {
    console.error("Update Visit Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update visit status",
    });
  }
};

// @desc    Cancel a visit
// @route   PATCH /api/visits/:id/cancel
// @access  Private (Buyer)
export const cancelVisit = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid visit ID",
      });
    }

    if (req.user.role !== "buyer") {
      return res.status(403).json({
        success: false,
        message: "Only buyers can cancel their visits",
      });
    }

    const visit = await Visit.findOne({
      _id: id,
      buyer: req.user._id,
    });

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: "Visit not found",
      });
    }

    if (!["pending", "confirmed"].includes(visit.status)) {
      return res.status(400).json({
        success: false,
        message: "This visit cannot be cancelled",
      });
    }

    visit.status = "cancelled";
    await visit.save();

    return res.status(200).json({
      success: true,
      message: "Visit cancelled successfully",
      visit,
    });
  } catch (error) {
    console.error("Cancel Visit Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to cancel visit",
    });
  }
};
