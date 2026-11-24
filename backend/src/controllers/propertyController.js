
import mongoose from "mongoose";
import Property from "../models/Property.js";
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
      amenities
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
        message: "Please provide all required property fields"
      });
    }

    // Only agents and admins can create properties
    if (!["agent", "admin"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only agents and admins can create properties"
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
      owner: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: "Property created successfully",
      property
    });

  } catch (error) {
    console.error("Create Property Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// GET ALL PROPERTIES

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
      limit = 9
    } = req.query;

    const filter = {
      status: "available"
    };

    // Search by title, description or city
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "location.city": { $regex: search, $options: "i" } }
      ];
    }

    // City filter
    if (city) {
      filter["location.city"] = {
        $regex: city,
        $options: "i"
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

    // Pagination validation
    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(limit) || 9));

    const skip = (currentPage - 1) * pageSize;

    // Sorting
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      priceLow: { price: 1 },
      priceHigh: { price: -1 }
    };

    const sortBy = sortOptions[sort] || sortOptions.newest;

    // Fetch properties and total count
    const [properties, totalProperties] = await Promise.all([
      Property.find(filter)
        .populate("owner", "name email phone avatar")
        .sort(sortBy)
        .skip(skip)
        .limit(pageSize),

      Property.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      properties,
      pagination: {
        currentPage,
        pageSize,
        totalProperties,
        totalPages: Math.ceil(totalProperties / pageSize),
        hasNextPage: currentPage < Math.ceil(totalProperties / pageSize),
        hasPrevPage: currentPage > 1
      }
    });

  } catch (error) {
    console.error("Get Properties Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch properties"
    });
  }
};


// GET SINGLE PROPERTY
export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID"
      });
    }

    const property = await Property.findById(id)
      .populate("owner", "name email phone avatar");

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    return res.status(200).json({
      success: true,
      property
    });

  } catch (error) {
    console.error("Get Property Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch property"
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
        message: "Invalid property ID"
      });
    }

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    // Only owner or admin can update
    const isOwner =
      property.owner.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You cannot update this property"
      });
    }

    // Do not allow changing ownership through this endpoint
    const {
      owner,
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
      "isVerified"
    ];

    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        property.set(key, updates[key]);
      }
    }

    await property.save();

    return res.status(200).json({
      success: true,
      message: "Property updated successfully",
      property
    });

  } catch (error) {
    console.error("Update Property Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message
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
        message: "Invalid property ID"
      });
    }

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    // Only owner or admin can delete
    const isOwner =
      property.owner.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete this property"
      });
    }

    await property.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Property deleted successfully"
    });

  } catch (error) {
    console.error("Delete Property Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete property"
    });
  }
};



export const uploadPropertyImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one image"
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
                fetch_format: "auto"
              }
            ]
          },
          (error, result) => {
            if (error) return reject(error);

            resolve({
              url: result.secure_url,
              publicId: result.public_id
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
      images
    });
  } catch (error) {
    console.error("Upload Property Images Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to upload property images"
    });
  }
};

