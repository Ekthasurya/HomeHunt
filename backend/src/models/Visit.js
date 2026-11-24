import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    visitDate: {
      type: Date,
      required: true
    },

    visitTime: {
      type: String,
      required: true
    },

    message: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "rejected",
        "cancelled",
        "completed"
      ],
      default: "pending"
    },

    agentNote: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

// Efficient visit queries
visitSchema.index({ buyer: 1, visitDate: 1 });
visitSchema.index({ agent: 1, visitDate: 1 });
visitSchema.index({ property: 1, status: 1 });

const Visit = mongoose.model("Visit", visitSchema);

export default Visit;