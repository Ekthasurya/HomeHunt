
import mongoose from "mongoose";
import Property from "../models/Property.js";
import Review from "../models/Review.js";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

// CREATE PROPERTY
export const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      propertyType,
      listingType,
      price,
      area,
      areaUnit,
      bedrooms,
      bathrooms,
      balconies,
      furnishing,
      images,
      location,
      amenities,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !propertyType ||
      !listingType ||
      price === undefined ||
      area === undefined ||
      !location?.address ||
      !location?.city ||
      !location?.state
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required property fields",
      });
    }

    // Only agents and admins can create properties
    if (!["agent", "admin"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only agents and admins can create properties",
      });
    }

    const property = await Property.create({
      title,
      description,
      propertyType,
      listingType,
      price,
      area,
      areaUnit,
      bedrooms,
      bathrooms,
      balconies,
      furnishing,
      images,
      location,
      amenities,
      owner: req.user._id,

      // Agent listings require admin approval
      approvalStatus:
        req.user.role === "admin" ? "approved" : "pending",

      rejectionReason: "",
    });

    return res.status(201).json({
      success: true,
      message:
        req.user.role === "admin"
          ? "Property created successfully"
          : "Property submitted successfully. Waiting for admin approval.",
      property,
    });
  } catch (error) {
    console.error("Create Property Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// GET ALL PUBLIC PROPERTIES
export const getProperties = async (req, res) => {
  try {
    const {
      search,
      city,
      propertyType,
      listingType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      furnishing,
      sort = "newest",
      page = 1,
      limit = 9,
    } = req.query;

    // Build filter conditions
    const andConditions = [
      { status: "available" },

      // Approved properties and legacy properties
      // without an approvalStatus field
      {
        $or: [
          { approvalStatus: "approved" },
          { approvalStatus: { $exists: false } },
        ],
      },
    ];

    // Search by title, description or city
    if (search?.trim()) {
      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      andConditions.push({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { "location.city": searchRegex },
        ],
      });
    }

    const filter = {};

    // City filter
    if (city) {
      filter["location.city"] = {
        $regex: city,
        $options: "i",
      };
    }

    // Property type filter
    if (propertyType) {
      filter.propertyType = propertyType;
    }

    // Sale or rent filter
    if (listingType) {
      filter.listingType = listingType;
    }

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};

      if (minPrice !== undefined) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice !== undefined) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Bedroom filter
    if (bedrooms !== undefined) {
      filter.bedrooms = Number(bedrooms);
    }

    // Bathroom filter
    if (bathrooms !== undefined) {
      filter.bathrooms = Number(bathrooms);
    }

    // Furnishing filter
    if (furnishing) {
      filter.furnishing = furnishing;
    }

    // Combine all filters
    andConditions.push(filter);

    const finalFilter = {
      $and: andConditions,
    };

    // Pagination validation
    const currentPage = Math.max(1, Number(page) || 1);

    const pageSize = Math.min(
      50,
      Math.max(1, Number(limit) || 9)
    );

    const skip = (currentPage - 1) * pageSize;

    // Sorting
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      priceLow: { price: 1 },
      priceHigh: { price: -1 },
    };

    const sortBy = sortOptions[sort] || sortOptions.newest;

    // Fetch properties and total count
    const [properties, totalProperties] = await Promise.all([
      Property.find(finalFilter)
        .populate("owner", "name email phone avatar")
        .sort(sortBy)
        .skip(skip)
        .limit(pageSize)
        .lean(),

      Property.countDocuments(finalFilter),
    ]);

    // Get property IDs from current page
    const propertyIds = properties.map(
      (property) => property._id
    );

    // Calculate ratings using MongoDB aggregation
    const ratingStats = await Review.aggregate([
      {
        $match: {
          property: { $in: propertyIds },
        },
      },
      {
        $group: {
          _id: "$property",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    // Create a lookup map for ratings
    const ratingMap = new Map(
      ratingStats.map((item) => [
        item._id.toString(),
        {
          averageRating: Number(item.averageRating.toFixed(1)),
          totalReviews: item.totalReviews,
        },
      ])
    );

    // Attach rating information to properties
    const propertiesWithRatings = properties.map((property) => {
      const rating = ratingMap.get(property._id.toString());

      return {
        ...property,
        averageRating: rating?.averageRating || 0,
        totalReviews: rating?.totalReviews || 0,
      };
    });

    return res.status(200).json({
      success: true,
      properties: propertiesWithRatings,
      pagination: {
        currentPage,
        pageSize,
        totalProperties,
        totalPages: Math.ceil(totalProperties / pageSize),
        hasNextPage:
          currentPage < Math.ceil(totalProperties / pageSize),
        hasPrevPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("Get Properties Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch properties",
    });
  }
};


// GET PROPERTIES FOR AGENT / ADMIN MANAGEMENT
export const getManagedProperties = async (req, res) => {
  try {
    const {
      search,
      status,
      propertyType,
      page = 1,
      limit = 50,
    } = req.query;

    // Agents see their own properties.
    // Admins can see all properties.
    const filter = {};

    if (req.user.role === "agent") {
      filter.owner = req.user._id;
    }

    if (status && status !== "All") {
      filter.status = status;
    }

    if (propertyType && propertyType !== "All") {
      filter.propertyType = propertyType;
    }

    if (search?.trim()) {
      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      filter.$or = [
        { title: searchRegex },
        { "location.city": searchRegex },
        { "location.address": searchRegex },
      ];
    }

    const currentPage = Math.max(1, Number(page) || 1);

    const pageSize = Math.min(
      100,
      Math.max(1, Number(limit) || 50)
    );

    const skip = (currentPage - 1) * pageSize;

    const [properties, totalProperties] = await Promise.all([
      Property.find(filter)
        .populate("owner", "name email phone avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),

      Property.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      properties,
      pagination: {
        currentPage,
        pageSize,
        totalProperties,
        totalPages: Math.ceil(totalProperties / pageSize),
      },
    });
  } catch (error) {
    console.error("Get Managed Properties Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch managed properties",
    });
  }
};



// GET SINGLE PROPERTY + TRACK PROPERTY VIEWS
export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    let property = await Property.findById(id)
      .populate("owner", "name email phone avatar");

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Legacy properties without approvalStatus are approved
    const isApproved =
      property.approvalStatus === "approved" ||
      !property.approvalStatus;

    const isOwner =
      req.user &&
      property.owner._id.toString() === req.user._id.toString();

    const isAdmin = req.user?.role === "admin";

    // Hide pending and rejected properties from other users
    if (!isApproved && !isOwner && !isAdmin) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Count views only for publicly available properties.
    // Do not count the owner's or admin's own views.
    if (
      isApproved &&
      property.status === "available" &&
      !isOwner &&
      !isAdmin
    ) {
      property = await Property.findByIdAndUpdate(
        id,
        {
          $inc: { views: 1 },
        },
        {
          new: true,
        }
      ).populate("owner", "name email phone avatar");
    }

    return res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    console.error("Get Property Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch property",
    });
  }
};



// UPDATE PROPERTY
export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Only owner or admin can update
    const isOwner =
      property.owner.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You cannot update this property",
      });
    }

    // Do not allow ownership or approval changes through this API
    const {
      owner,
      approvalStatus,
      rejectionReason,
      ...updates
    } = req.body;

    const allowedFields = [
      "title",
      "description",
      "propertyType",
      "listingType",
      "price",
      "area",
      "areaUnit",
      "bedrooms",
      "bathrooms",
      "balconies",
      "furnishing",
      "images",
      "location",
      "amenities",
      "status",
      "isFeatured",
      "isVerified",
    ];

    // Keep a copy of original images
    const oldImages = property.images.map((image) => ({
      url: image.url,
      publicId: image.publicId,
    }));

    let hasChanges = false;

    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        property.set(key, updates[key]);
        hasChanges = true;
      }
    }

    // Agent edits require admin approval again
    if (hasChanges && req.user.role === "agent") {
      property.approvalStatus = "pending";
      property.rejectionReason = "";
    }

    // Save updated property first
    await property.save();

    // Find images removed from the property
    const currentPublicIds = new Set(
      property.images.map((image) => image.publicId)
    );

    const removedImages = oldImages.filter(
      (image) => !currentPublicIds.has(image.publicId)
    );

    // Delete removed images from Cloudinary
    if (removedImages.length > 0) {
      await deleteCloudinaryImages(removedImages);
    }

    return res.status(200).json({
      success: true,
      message:
        hasChanges && req.user.role === "agent"
          ? "Property updated successfully. It is waiting for admin approval."
          : "Property updated successfully",
      property,
    });
  } catch (error) {
    console.error("Update Property Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// DELETE PROPERTY
export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Only owner or admin can delete
    const isOwner =
      property.owner.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete this property",
      });
    }

    // Keep image references before deleting
    const propertyImages = property.images.map((image) => ({
      url: image.url,
      publicId: image.publicId,
    }));

    // Delete property from MongoDB
    await property.deleteOne();

    // Delete associated images from Cloudinary
    await deleteCloudinaryImages(propertyImages);

    return res.status(200).json({
      success: true,
      message: "Property and associated images deleted successfully",
    });
  } catch (error) {
    console.error("Delete Property Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete property",
    });
  }
};


// UPLOAD PROPERTY IMAGES
export const uploadPropertyImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one image",
      });
    }

    const uploadImage = (file) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "homehunt/properties",
            resource_type: "image",
            transformation: [
              {
                width: 1200,
                height: 900,
                crop: "limit",
                quality: "auto",
                fetch_format: "auto",
              },
            ],
          },
          (error, result) => {
            if (error) return reject(error);

            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        );

        Readable.from(file.buffer).pipe(stream);
      });
    };

    const images = await Promise.all(
      req.files.map(uploadImage)
    );

    return res.status(200).json({
      success: true,
      message: "Property images uploaded successfully",
      images,
    });
  } catch (error) {
    console.error("Upload Property Images Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to upload property images",
    });
  }
};


// DELETE IMAGES FROM CLOUDINARY
const deleteCloudinaryImages = async (images = []) => {
  const publicIds = images
    .map((image) => image?.publicId)
    .filter(
      (publicId) =>
        typeof publicId === "string" && publicId.trim()
    );

  if (!publicIds.length) return;

  const results = await Promise.allSettled(
    publicIds.map((publicId) =>
      cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        invalidate: true,
      })
    )
  );

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `Cloudinary deletion failed for ${publicIds[index]}:`,
        result.reason
      );
    }
  });
};
