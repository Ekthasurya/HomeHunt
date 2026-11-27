
import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Property title is required"],
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    propertyType: {
      type: String,
      required: true,
      enum: [
        "apartment",
        "house",
        "villa",
        "plot",
        "commercial",
      ],
    },

    listingType: {
      type: String,
      required: true,
      enum: ["sale", "rent"],
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    area: {
      type: Number,
      required: true,
      min: 0,
    },

    areaUnit: {
      type: String,
      enum: ["sqft", "sqm", "acre"],
      default: "sqft",
    },

    bedrooms: {
      type: Number,
      default: 0,
      min: 0,
    },

    bathrooms: {
      type: Number,
      default: 0,
      min: 0,
    },

    balconies: {
      type: Number,
      default: 0,
      min: 0,
    },

    furnishing: {
      type: String,
      enum: [
        "furnished",
        "semi-furnished",
        "unfurnished",
      ],
      default: "unfurnished",
    },

    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          default: "",
        },
      },
    ],

    location: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        default: "India",
      },
      pincode: {
        type: String,
        default: "",
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },

    amenities: [
      {
        type: String,
        trim: true,
      },
    ],

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Property availability status
    status: {
      type: String,
      enum: [
        "available",
        "sold",
        "rented",
        "pending",
      ],
      default: "available",
    },

    // Admin approval workflow
    approvalStatus: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
      ],
      default: "approved",
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common property searches
propertySchema.index({
  "location.city": 1,
  propertyType: 1,
  listingType: 1,
  price: 1,
});

propertySchema.index({
  owner: 1,
  createdAt: -1,
});

propertySchema.index({
  approvalStatus: 1,
  createdAt: -1,
});

const Property = mongoose.model("Property", propertySchema);

export default Property;
