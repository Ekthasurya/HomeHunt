import mongoose from "mongoose";
import Bookmark from "../models/Bookmark.js";
import Property from "../models/Property.js";

// @desc    Add property to bookmarks
// @route   POST /api/bookmarks/:propertyId
// @access  Private
export const addBookmark = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID"
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    const existingBookmark = await Bookmark.findOne({
      user: req.user._id,
      property: propertyId
    });

    if (existingBookmark) {
      return res.status(409).json({
        success: false,
        message: "Property is already bookmarked"
      });
    }

    const bookmark = await Bookmark.create({
      user: req.user._id,
      property: propertyId
    });

    return res.status(201).json({
      success: true,
      message: "Property added to bookmarks",
      bookmark
    });
  } catch (error) {
    console.error("Add Bookmark Error:", error);

    // Handle duplicate-key errors from the unique index
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Property is already bookmarked"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to add bookmark"
    });
  }
};


// @desc    Remove property from bookmarks
// @route   DELETE /api/bookmarks/:propertyId
// @access  Private
export const removeBookmark = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID"
      });
    }

    const bookmark = await Bookmark.findOneAndDelete({
      user: req.user._id,
      property: propertyId
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: "Bookmark not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Property removed from bookmarks"
    });
  } catch (error) {
    console.error("Remove Bookmark Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove bookmark"
    });
  }
};


// @desc    Get logged-in user's bookmarks
// @route   GET /api/bookmarks
// @access  Private
export const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({
      user: req.user._id
    })
      .populate({
        path: "property",
        populate: {
          path: "owner",
          select: "name email phone avatar"
        }
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalBookmarks: bookmarks.length,
      bookmarks
    });
  } catch (error) {
    console.error("Get Bookmarks Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch bookmarks"
    });
  }
};