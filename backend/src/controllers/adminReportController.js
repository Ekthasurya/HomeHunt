
import ExcelJS from "exceljs";

import User from "../models/User.js";
import Property from "../models/Property.js";
import Visit from "../models/Visit.js";
import Review from "../models/Review.js";

// ============================================
// DATE FILTER HELPER
// ============================================

const getCreatedAtFilter = (req, res) => {
  const { startDate, endDate } = req.query;

  const isValidDate = (value) => {
    if (typeof value !== "string") return false;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  };

  if (startDate && !isValidDate(startDate)) {
    res.status(400).json({
      success: false,
      message: "Invalid start date. Use YYYY-MM-DD format.",
    });

    return null;
  }

  if (endDate && !isValidDate(endDate)) {
    res.status(400).json({
      success: false,
      message: "Invalid end date. Use YYYY-MM-DD format.",
    });

    return null;
  }

  if (startDate && endDate && startDate > endDate) {
    res.status(400).json({
      success: false,
      message: "Start date cannot be after end date.",
    });

    return null;
  }

  const filter = {};

  if (startDate || endDate) {
    filter.createdAt = {};

    if (startDate) {
      filter.createdAt.$gte = new Date(
        `${startDate}T00:00:00.000Z`
      );
    }

    if (endDate) {
      filter.createdAt.$lte = new Date(
        `${endDate}T23:59:59.999Z`
      );
    }
  }

  return filter;
};

// ============================================
// REUSABLE EXCEL REPORT GENERATOR
// ============================================

const generateExcelReport = async ({
  res,
  filename,
  sheetName,
  columns,
  rows,
}) => {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "HomeHunt Admin";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.columns = columns;

  worksheet.addRows(rows);

  // Header styling
  const headerRow = worksheet.getRow(1);

  headerRow.height = 25;

  headerRow.eachCell((cell) => {
    cell.font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
      size: 11,
    };

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2563EB" },
    };

    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
    };
  });

  // General worksheet styling
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.eachCell((cell) => {
        cell.alignment = {
          vertical: "middle",
          wrapText: true,
        };
      });
    }
  });

  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  // Add Excel filters
  worksheet.autoFilter = {
    from: "A1",
    to: `${worksheet.getColumn(worksheet.columnCount).letter}1`,
  };

  // Set download headers
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );

  await workbook.xlsx.write(res);

  res.end();
};

// ============================================
// EXPORT USERS REPORT
// ============================================

export const exportUsersReport = async (req, res) => {
  try {
    const dateFilter = getCreatedAtFilter(req, res);

    if (dateFilter === null) return;

    const users = await User.find({
      deletedAt: null,
      ...dateFilter,
    })
      .select("name email phone role isActive createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const columns = [
      { header: "User Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 18 },
      { header: "Role", key: "role", width: 15 },
      { header: "Account Status", key: "status", width: 18 },
      { header: "Registered Date", key: "createdAt", width: 22 },
    ];

    const rows = users.map((user) => ({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "",
      status: user.isActive ? "Active" : "Inactive",
      createdAt: user.createdAt || "",
    }));

    await generateExcelReport({
      res,
      filename: "HomeHunt_Users_Report.xlsx",
      sheetName: "Users",
      columns,
      rows,
    });
  } catch (error) {
    console.error("Export Users Report Error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Failed to export users report",
      });
    }
  }
};

// ============================================
// EXPORT PROPERTIES REPORT
// ============================================

export const exportPropertiesReport = async (req, res) => {
  try {
    const dateFilter = getCreatedAtFilter(req, res);

    if (dateFilter === null) return;

    const properties = await Property.find(dateFilter)
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const columns = [
      { header: "Property Title", key: "title", width: 30 },
      { header: "Property Type", key: "propertyType", width: 18 },
      { header: "Listing Type", key: "listingType", width: 15 },
      { header: "Price", key: "price", width: 18 },
      { header: "City", key: "city", width: 18 },
      { header: "State", key: "state", width: 20 },
      { header: "Owner Name", key: "ownerName", width: 25 },
      { header: "Owner Email", key: "ownerEmail", width: 30 },
      { header: "Approval Status", key: "approvalStatus", width: 18 },
      { header: "Property Status", key: "status", width: 18 },
      { header: "Verified", key: "verified", width: 12 },
      { header: "Featured", key: "featured", width: 12 },
      { header: "Views", key: "views", width: 12 },
      { header: "Created Date", key: "createdAt", width: 22 },
    ];

    const rows = properties.map((property) => ({
      title: property.title || "",
      propertyType: property.propertyType || "",
      listingType: property.listingType || "",
      price: property.price || 0,
      city: property.location?.city || "",
      state: property.location?.state || "",
      ownerName: property.owner?.name || "",
      ownerEmail: property.owner?.email || "",
      approvalStatus: property.approvalStatus || "approved",
      status: property.status || "",
      verified: property.isVerified ? "Yes" : "No",
      featured: property.isFeatured ? "Yes" : "No",
      views: property.views || 0,
      createdAt: property.createdAt || "",
    }));

    await generateExcelReport({
      res,
      filename: "HomeHunt_Properties_Report.xlsx",
      sheetName: "Properties",
      columns,
      rows,
    });
  } catch (error) {
    console.error("Export Properties Report Error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Failed to export properties report",
      });
    }
  }
};

// ============================================
// EXPORT VISITS REPORT
// ============================================

export const exportVisitsReport = async (req, res) => {
  try {
    const dateFilter = getCreatedAtFilter(req, res);

    if (dateFilter === null) return;

    const visits = await Visit.find(dateFilter)
      .populate("property", "title location price")
      .populate("buyer", "name email")
      .populate("agent", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const columns = [
      { header: "Property", key: "property", width: 30 },
      { header: "Buyer Name", key: "buyerName", width: 25 },
      { header: "Buyer Email", key: "buyerEmail", width: 30 },
      { header: "Agent Name", key: "agentName", width: 25 },
      { header: "Agent Email", key: "agentEmail", width: 30 },
      { header: "Visit Date", key: "visitDate", width: 18 },
      { header: "Visit Time", key: "visitTime", width: 15 },
      { header: "Status", key: "status", width: 18 },
      { header: "Message", key: "message", width: 40 },
      { header: "Agent Note", key: "agentNote", width: 40 },
      { header: "Requested Date", key: "createdAt", width: 22 },
    ];

    const rows = visits.map((visit) => ({
      property: visit.property?.title || "",
      buyerName: visit.buyer?.name || "",
      buyerEmail: visit.buyer?.email || "",
      agentName: visit.agent?.name || "",
      agentEmail: visit.agent?.email || "",
      visitDate: visit.visitDate || "",
      visitTime: visit.visitTime || "",
      status: visit.status || "",
      message: visit.message || "",
      agentNote: visit.agentNote || "",
      createdAt: visit.createdAt || "",
    }));

    await generateExcelReport({
      res,
      filename: "HomeHunt_Visits_Report.xlsx",
      sheetName: "Visits",
      columns,
      rows,
    });
  } catch (error) {
    console.error("Export Visits Report Error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Failed to export visits report",
      });
    }
  }
};

// ============================================
// EXPORT REVIEWS REPORT
// ============================================

export const exportReviewsReport = async (req, res) => {
  try {
    const dateFilter = getCreatedAtFilter(req, res);

    if (dateFilter === null) return;

    const reviews = await Review.find(dateFilter)
      .populate("property", "title")
      .populate("buyer", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const columns = [
      { header: "Property", key: "property", width: 30 },
      { header: "Buyer Name", key: "buyerName", width: 25 },
      { header: "Buyer Email", key: "buyerEmail", width: 30 },
      { header: "Rating", key: "rating", width: 12 },
      { header: "Comment", key: "comment", width: 50 },
      { header: "Review Date", key: "createdAt", width: 22 },
    ];

    const rows = reviews.map((review) => ({
      property: review.property?.title || "",
      buyerName: review.buyer?.name || "",
      buyerEmail: review.buyer?.email || "",
      rating: review.rating || 0,
      comment: review.comment || "",
      createdAt: review.createdAt || "",
    }));

    await generateExcelReport({
      res,
      filename: "HomeHunt_Reviews_Report.xlsx",
      sheetName: "Reviews",
      columns,
      rows,
    });
  } catch (error) {
    console.error("Export Reviews Report Error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Failed to export reviews report",
      });
    }
  }
};
